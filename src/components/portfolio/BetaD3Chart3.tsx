import { displayBalance } from '@/utils/display'
import { calculateBetaFunction } from '@/utils/beta'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import Image from 'next/image'
import { parseEther } from 'viem'

const d = calculateBetaFunction(3, 3)
const data = d.map((t) => (t.x === 0 && t.y === 0 ? { name: 'b', x: 0, y: 0 } : t))

const marginX = 10
const margin = { top: 60, bottom: 20, left: marginX, right: marginX }
let rendered = false
export const BetaD3Chart3 = ({ ratio }: { ratio: number }) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [x, setX] = useState(0)
  const [cx, setCx] = useState(0n)
  const [chartW, setChartW] = useState(0)
  const [chartH, setChartH] = useState(0)
  const [showEnd, setShowEnd] = useState(false)
  const [endValue, setEndValue] = useState('')
  const xPadding = 0
  const minPrice = parseEther('8')
  const expectedPrice = parseEther('9')
  const maxPrice = parseEther('10')

  useLayoutEffect(() => {
    if (!chartRef.current || !svgRef.current) return
    // if (rendered) return
    if (minPrice >= 0 && expectedPrice >= 0 && maxPrice >= 0) {
      rendered = true
      const chartW = chartRef.current.offsetWidth
      console.log(chartW)
      const chartH = 220 / ratio
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
          .attr('x2', '0')
          .attr('y2', '100%')

        gradient.append('stop').attr('offset', '0%').attr('style', 'stop-color:rgba(255,172,3,.85);stop-opacity:0.2')
        // gradient.append('stop').attr('class', 'end').attr('offset', '100%').attr('style', 'stop-color:#FFAC034D;stop-opacity:1')
        gradient.append('stop').attr('offset', '100%').attr('style', 'stop-color:rgba(255,172,3);stop-opacity:0')
      }

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
        .attr('stroke', '#fff')

      svg.select('.domain').attr('stroke', '#ddd')

      const tooltipLine = svg
        .select('#tooltip-line')
        .attr('width', 1)
        .attr('height', 100)
        .attr('x1', 10)
        .attr('y1', 0)
        .attr('x2', 10)
        .attr('y2', 260)
        .attr('stroke', '#fff')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '4,4')
        .style('opacity', 0)
        .style('pointer-events', 'none')

      const tooltipArrow = svg.select('#tooltip-arrow').attr('points', '0,0 0,0 0,0').attr('fill', '#fff')
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

          // tooltipEllipse
          //   .attr('cx', realX)
          //   .attr('cy', dh - dy / 2)
          //   .attr('opacity', 1)
          //   .raise()

          tooltipText
            .attr('x', realX - 15)
            .attr('y', dh + 30)
            .text(displayBalance(dx + minPrice, 2))
            .raise()
          // .attr('y', dh - dy / 2 + 6)

          setCx(dx + minPrice)
          setX(x)
        })
        .on('mouseleave', function (event) {
          tooltipEllipse.attr('opacity', 0)
          tooltipText.text('')
          tooltipLine.style('opacity', 0).raise()
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
      brushG.selectAll('.selection').style('pointer-events', 'none').style('stroke', 'none').style('fill', 'none')
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
      // brushG.selectAll('.handle').style('fill', '#fff').style('stroke', 'none').style('width', '2px')
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
  }, [svgRef, chartW, chartH, minPrice, maxPrice])

  return (
    <div className={'relative px-4'}>
      <div className={'relative'}>
        {x > 0 && x <= 1 && (
          <div className={'hidden'}>
            <div className='absolute text-xs bottom-20 -ml-16 flex flex-col items-center'>
              Random Price &lt; {displayBalance(cx, 2)}
              <div className={'px-3 mt-1 py-1 text-xs rounded-full border border-white'}>{(x * 100).toFixed(0)}%</div>
            </div>

            <div className='absolute bottom-20 right-0 text-xs flex flex-col items-center -mr-16'>
              Random Price &gt; {displayBalance(cx, 2)}
              <div className={'px-3 mt-1 py-1 text-xs rounded-full border-white border'}>{((1 - x) * 100).toFixed(0)}%</div>
            </div>
          </div>
        )}
        {/*<div className="text-center mb-4 text-xs pr-8">Expected Price</div>*/}
        {/*<div id={'chart'} ref={chartRef} className={'bg-grayx'}></div>*/}
        <div id={'chart'} ref={chartRef} className={'bg-grayx'}>
          <svg ref={svgRef} width={chartW} height={chartH + 10}>
            <rect
              id={'33222'}
              width={1}
              height={chartH - margin.top - margin.bottom}
              x={chartW / 2}
              y={margin.top}
              className={'z-50'}
              stroke={'#fff'}
              strokeWidth={1}
              strokeDasharray={'4,4'}
            />
            {/*<text fill={'#fff'} fontSize={12} x={chartW / 2 - 40} y={20}>*/}
            {/*  Expected price*/}
            {/*</text>*/}
            <rect width={chartW + 80} height={1} x={0} y={chartH - 20} fill={'#fff'} />
            <g transform={`translate(${margin.left}, ${margin.top})`} id={'g'}>
              <line id={'tooltip-line'} />
              <polygon id={'tooltip-arrow'} fill={'#fff'} points={'2,2 2,2 2,2'} />
              <ellipse ry={16} rx={30} stroke={'#fff'} opacity={0} fill={'#00FFE080'} fontSize={14} id={'tooltip-ellipse'} />
              <text id={'tooltip-text'} fontSize={13} fill={'#fff'} />
              <ellipse ry={16} rx={30} stroke={'#fff'} opacity={0} fill={'#00FFE080'} fontSize={14} id={'end-tooltip-ellipse'} />
              <text id={'end-tooltip-text'} fontSize={13} fontWeight={800} />
            </g>
          </svg>
        </div>
      </div>
    </div>
  )
}
