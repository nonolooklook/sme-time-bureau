import { displayBalance } from '@/utils/display'
import { calculateBetaFunction } from '@/utils/beta'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import Image from 'next/image'

const d = calculateBetaFunction(3, 3)
const data = d.map((t) => (t.x === 0 && t.y === 0 ? { name: 'b', x: 0, y: 0 } : t))

const marginX = 80
const margin = { top: 60, bottom: 20, left: marginX, right: marginX }
let rendered = false
export const BetaD3Chart = ({
  minPrice,
  expectedPrice,
  maxPrice,
  buy,
  withBrush,
}: {
  minPrice: bigint
  expectedPrice: bigint
  maxPrice: bigint
  buy?: boolean
  withBrush?: boolean
}) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [x, setX] = useState(0)
  const [cx, setCx] = useState(0n)
  const [chartW, setChartW] = useState(0)
  const [chartH, setChartH] = useState(0)
  const [showEnd, setShowEnd] = useState(false)
  const [endValue, setEndValue] = useState('')
  const xPadding = 0

  useLayoutEffect(() => {
    console.log(2222222222, chartRef, svgRef)
    if (!chartRef.current || !svgRef.current) return
    // if (rendered) return
    if (minPrice > 0 && expectedPrice > 0 && maxPrice > 0) {
      rendered = true
      const chartW = chartRef.current.offsetWidth
      const chartH = 260
      setChartW(chartW)
      setChartH(chartH)
      const width = chartW - margin.left - margin.right
      const height = chartH - margin.top - margin.bottom

      const createGradient = (select: any) => {
        const gradient = select
          .select('defs')
          .append('linearGradient')
          .attr('id', 'gradient')
          .attr('x1', '0')
          .attr('y1', '0')
          .attr('x2', '1')
          .attr('y2', '0')

        gradient.append('stop').attr('offset', '0%').attr('style', 'stop-color:#82ca9d;stop-opacity:0.8')
        gradient.append('stop').attr('class', 'end').attr('offset', '100%').attr('style', 'stop-color:#e9efd2;stop-opacity:0.2')
        gradient.append('stop').attr('class', 'end').attr('offset', '100%').attr('style', 'stop-color:#e17ae7;stop-opacity:1')
        gradient.append('stop').attr('offset', '100%').attr('style', 'stop-color:#e17ae7;stop-opacity:1')
      }

      // const svgM = d3.select('#chart').append('svg');
      const svgM = d3.select(svgRef.current)
      const svg = svgM.select('#g')

      svg.append('defs')
      svg.call(createGradient)

      const xScale = d3.scaleLinear().domain([0, 1]).range([0, width])
      const yScale = d3.scaleLinear().domain([0, 1.875]).range([height, 0])

      const line = d3
        .line()
        .x((d: any) => xScale(d.x))
        .y((d: any) => yScale(d.y))
        .curve(d3.curveCatmullRom.alpha(0.5))

      svg
        .append('path')
        .datum(data)
        .attr('d', (d) => line(data as any))
        .style('fill', 'url(#gradient)')

      svg
        .append('path')
        .datum(data)
        .attr('d', (d) => line(data as any))
        .attr('stroke-width', '1')
        .style('fill', 'none')
        .style('filter', 'url(#glow)')
        .attr('stroke', '#000')

      svg.select('.domain').attr('stroke', '#ddd')

      const tooltipLine = svg
        .select('#tooltip-line')
        .attr('width', 1)
        .attr('height', 100)
        .attr('x1', 10)
        .attr('y1', 0)
        .attr('x2', 10)
        .attr('y2', 260)
        .attr('stroke', '#000')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '4,4')
        .style('opacity', 0)
        .style('pointer-events', 'none')

      const tooltipArrow = svg.select('#tooltip-arrow').attr('points', '0,0 0,0 0,0').attr('fill', 'lightblue')
      const tooltipEllipse = svg.select('#tooltip-ellipse')
      const tooltipText = svg.select('#tooltip-text')
      svg
        .append('rect')
        .attr('width', chartW - margin.right - margin.left)
        .attr('height', chartH - margin.top - margin.bottom + 100)
        .attr('y', -100)
        .style('opacity', 0.0)
        .on('touchmouse mousemove', function (event) {
          const mousePos = d3.pointer(event, this)
          const xAccessor = (d: any) => d.x
          const yAccessor = (d: any) => d.y
          const realX = mousePos[0]
          const x = xScale.invert(realX)
          const xBisector = d3.bisector(xAccessor).left
          const bisectionIndex = xBisector(data, x)
          const hoveredIndexData = data[Math.max(0, bisectionIndex - 1)]
          const dx = (BigInt(bisectionIndex) * (maxPrice - minPrice)) / 50n
          const dh = chartH - margin.top - margin.bottom
          const dy = (dh / 1.875) * hoveredIndexData.y
          tooltipLine
            .style('opacity', 1)
            .attr('x1', realX)
            .attr('y1', dh - dy)
            .attr('x2', realX)
            .attr('y2', dh)
            .raise()
          // .attr('cx', xScale(xAccessor(hoveredIndexData)))
          // .attr('cy', yScale(yAccessor(hoveredIndexData)))
          tooltipArrow.attr('opacity', 1).attr('points', `${realX},${dh + 6} ${realX + 6},${dh + 14} ${realX - 6},${dh + 14}`)

          tooltipEllipse
            .attr('cx', realX)
            .attr('cy', dh - dy / 2)
            .attr('opacity', 1)
            .raise()

          tooltipText
            .attr('x', realX - 15)
            .attr('y', dh - dy / 2 + 6)
            .text(displayBalance(dx + minPrice))
            .raise()

          setCx(dx + minPrice)
          setX(x)
        })
        .on('mouseleave', function (event) {
          tooltipEllipse.attr('opacity', 0)
          tooltipText.text('')
          tooltipLine.attr('opacity', 0)
          tooltipArrow.attr('opacity', 0)
          setX(0)
        })
    }
  }, [chartRef, minPrice, expectedPrice, maxPrice])

  useLayoutEffect(() => {
    if (!svgRef.current) return
    if (chartW > 0 || chartH > 0) {
      const width = chartW - margin.left - margin.right
      const height = chartH - margin.top - margin.bottom
      const svgM = d3.select(svgRef.current)
      const svg = svgM.select('#g')

      const endEllipse = svg.select('#end-tooltip-ellipse')
      const endText = svg.select('#end-tooltip-text')
      function brushed(event: any) {
        const selection = event.selection
        if (selection === null) {
          // circle.attr('stroke', null);
        } else {
          const xPercentage = (selection[1] / width) * 100
          d3.selectAll('.end').attr('offset', `${xPercentage}%`)
          if (selection[1] < width) {
            const bp = minPrice + ((maxPrice - minPrice) * BigInt(xPercentage.toFixed(0))) / 100n
            const price = displayBalance(bp)
            setShowEnd(true)
            setEndValue(price)

            endText
              .attr('x', selection[1] + 25)
              .attr('y', 56)
              .text(price)
              .raise()
            endEllipse
              .style('opacity', 1)
              .attr('cy', 50)
              .attr('cx', selection[1] + 40)
              .raise()
            // const [x0, x1] = selection.map(x);
            // circle.attr('stroke', (d) => (x0 <= d && d <= x1 ? 'red' : null));
          }
        }
      }

      const brush = d3.brushX().extent([
        [xPadding, 0],
        [width - xPadding, height],
      ])
      // .on('brush', brushed)
      const brushG = svg
        .append('g')
        .call(brush)
        .call(brush.move, [xPadding, width - xPadding])

      brushG.selectAll('.overlay').style('pointer-events', 'none')
      brushG
        .selectAll('.selection')
        .style('pointer-events', 'none')
        .style('stroke', 'none')
        .style('fill', withBrush ? '#999' : 'none')
      var smallRectWidth = 6
      var smallRectHeight = 20
      const dropTooltip = svg.select('#drop-tooltip')
      brushG
        .select('.handle--e')
        .on('touchmouse mousemove', (event: any) => {
          const mousePos = d3.pointer(event, this)
          dropTooltip.style('opacity', 0)
          // dropTooltip
          //   .style('opacity', 1)
          //   .selectAll('tspan')
          //   .attr('x', mousePos[0] - 100);
        })
        .on('mouseleave', () => {
          dropTooltip.style('opacity', 0)
        })
      brushG.selectAll('.handle').style('fill', '#000').style('stroke', 'none').style('width', '2px')
      brushG.selectAll('.handle').each(function () {
        d3.select(this)
          .append('rect')
          .attr('width', smallRectWidth)
          .attr('height', smallRectHeight)
          .attr('x', -smallRectWidth / 2) // 将矩形置于手柄中心
          .attr('y', -smallRectHeight / 2)
          .attr('fill', 'red')
      })
    }
  }, [svgRef, chartW, chartH, minPrice, maxPrice, withBrush])

  useEffect(() => {
    if (!svgRef.current) return
    const svgM = d3.select(svgRef.current)
    const svg = svgM.select('#g')
    const width = chartW - margin.left - margin.right
    const height = chartH - margin.top - margin.bottom
    if (chartW > 0 && chartH > 0) {
      const xAxisScale = d3
        .scaleLinear()
        .domain([Number(displayBalance(minPrice)), Number(displayBalance(maxPrice))])
        .range([0, width])
      svg.select('#price-scale').remove()
      const axisX = svg
        .append('g')
        .attr('id', 'price-scale')
        .attr('transform', `translate(0,${height})`)
        .call(
          d3
            .axisBottom(xAxisScale)
            .tickValues([Number(displayBalance(minPrice)), Number(displayBalance(expectedPrice)), Number(displayBalance(maxPrice))])
            .tickSize(0)
            .tickPadding(30),
        )
      axisX.selectAll('text').style('font-size', '18px')
    }
  }, [minPrice, expectedPrice, maxPrice, svgRef, chartW, chartH])

  return (
    <div className={'pt-[60px] relative'}>
      {x > 0 && x <= 1 && (
        <div className={'flex justify-end mb-8 absolute top-4 left-0'}>
          <div className={'border border-black rounded-lg p-2 w-[380px] text-sm'}>
            The probability of a deal occurring above {displayBalance(cx)} is {((1 - x) * 100).toFixed(0)}%.
          </div>
        </div>
      )}
      <div className={'relative'}>
        {x > 0 && x <= 1 && (
          <>
            <div className={'absolute px-3 py-1 bg-[rgba(158,184,0,.1)] rounded-full bottom-28 border-primary border'}>
              {(x * 100).toFixed(0)}%
            </div>
            <div className={'absolute right-0 px-3 py-1 bg-[rgba(158,184,0,.1)] rounded-full bottom-28 border-primary border'}>
              {((1 - x) * 100).toFixed(0)}%
            </div>
          </>
        )}
        {/*<div className="text-center mb-4 text-xs pr-8">Expected Price</div>*/}
        {/*<div id={'chart'} ref={chartRef} className={'bg-grayx'}></div>*/}
        <div id={'chart'} ref={chartRef} className={'bg-grayx'}>
          <svg ref={svgRef} width={chartW} height={chartH + 10}>
            <rect width={1} height={chartH - margin.top / 2 - margin.bottom} x={chartW / 2} y={margin.top / 2} className={'z-50'} />
            <text fill={'black'} fontSize={12} x={chartW / 2 - 40} y={20}>
              Expected price
            </text>
            <rect width={chartW} height={1} x={0} y={chartH - 20} />
            <g transform={`translate(${margin.left}, ${margin.top})`} id={'g'}>
              <line id={'tooltip-line'} />
              <polygon id={'tooltip-arrow'} fill={'#000'} points={'2,2 2,2 2,2'} />
              <ellipse ry={16} rx={30} stroke={'#000'} opacity={0} fill={'#00FFE080'} fontSize={14} id={'tooltip-ellipse'} />
              <text id={'tooltip-text'} fontSize={13} fontWeight={800} />
              {withBrush && (
                <text id={'drop-tooltip'} fontSize={12} fontWeight={400} width={20} fill={'#666'} opacity={1}>
                  <tspan x={chartW - 230} y='10'>
                    Drag this bar to set your
                  </tspan>
                  <tspan x={chartW - 230} y='26'>
                    price rejection range
                  </tspan>
                </text>
              )}
              <ellipse ry={16} rx={30} stroke={'#000'} opacity={0} fill={'#00FFE080'} fontSize={14} id={'end-tooltip-ellipse'} />
              <text id={'end-tooltip-text'} fontSize={13} fontWeight={800} />
            </g>
          </svg>
          <Image src={'/usdt.svg'} alt={'usdt'} width={16} height={16} className={'absolute right-0 bottom-10'} />
          <div className={'-mt-4 py-2 text-sm flex items-center justify-between mb-4 px-16'}>
            <div>{displayBalance(minPrice)}</div>
            <div>{displayBalance(expectedPrice)}</div>
            <div>{displayBalance(maxPrice)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
