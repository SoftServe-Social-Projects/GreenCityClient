import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Chart } from 'chart.js';
import 'chartjs-plugin-labels';
import { DayEstimation } from 'src/app/main/model/habit/DayEstimation';
import { HabitStatisticsDto } from 'src/app/main/model/habit/HabitStatisticsDto';

@Component({
  selector: 'app-habit-chart',
  templateUrl: './habit-chart.component.html',
  styleUrls: ['./habit-chart.component.scss']
})
export class HabitChartComponent implements OnInit, OnChanges {
  @Input() caption: string;
  @Input() values: HabitStatisticsDto[];
  @Input() chartId;
  @Input() redrawTrigger: boolean;

  readonly shape = 'assets/img/habit-circle-bg-shape.png';

  // SETTINGS
  showTooltipOnHover = false;

  readonly COLOR_GOOD = '#a7dc2f'; // 3
  readonly COLOR_NORMAL = '#056b36'; // 2
  readonly COLOR_BAD = '#ffe200'; // 1
  readonly COLOR_WHITE = '#fff'; // 0
  readonly COLOR_LIGHT_BLUE = 'rgba(197, 230, 255, 0.4)';

  // !SETTINGS

  outerHabitChart: Chart;

  outerLabels = [];
  habitChartDataset = [
    {
      label: 'Bags',
      data: [],
      backgroundColor: [],
      borderColor: this.COLOR_WHITE,
      borderWidth: 3
    }
  ];

  ngOnInit() {
    const canvas = document.getElementById('chartIdGeneral');
    canvas.id = this.chartId;
    this.fillSegments();
    this.drawChart();
  }

  private drawChart() {
    this.outerHabitChart = new Chart(this.chartId, {
      type: 'doughnut',
      data: {
        datasets: this.habitChartDataset,
        labels: this.outerLabels
      },
      options: {
        animation: {
          duration: 0
        },
        cutoutPercentage: 61,
        responsive: false,
        legend: {
          display: false
        },
        tooltips: {
          enabled: this.showTooltipOnHover,
          displayColors: false,
          titleAlign: 'right',
          bodyAlign: 'right',
          footerAlign: 'right',
          callbacks: {
            label(tooltipItem, data) {
              const tooltip = data.datasets[tooltipItem.datasetIndex];
              const value = data.labels[tooltipItem.index];
              return value === 0 ? tooltip.label + ': ' + 0 : tooltip.label + ': ' + value;
            }
          }
        },
        plugins: {
          labels: {
            render(args) {
              return args.label >= 0 ? args.label : '';
            },
            fontSize: 16,
            fontColor: this.COLOR_WHITE
          }
        }
      }
    });
  }

  private fillSegments() {
    this.values.forEach((el) => {
      this.habitChartDataset[0].data = [...this.habitChartDataset[0].data, 1];
      let color;
      switch (el.habitRate) {
        case DayEstimation.NORMAL.toString():
          color = this.COLOR_NORMAL;
          break;
        case DayEstimation.GOOD.toString():
          color = this.COLOR_GOOD;
          break;
        case DayEstimation.BAD.toString():
          color = this.COLOR_BAD;
          break;
        default:
          color = this.COLOR_LIGHT_BLUE;
          break;
      }

      this.habitChartDataset[0].backgroundColor = [...this.habitChartDataset[0].backgroundColor, color];

      this.outerLabels = [...this.outerLabels, el.amountOfItems];
    });
  }

  ngOnChanges(): void {
    if (this.outerHabitChart) {
      this.habitChartDataset = [
        {
          label: 'Bags',
          data: [],
          backgroundColor: [],
          borderColor: this.COLOR_WHITE,
          borderWidth: 3
        }
      ];
      this.outerLabels = [];
      this.outerHabitChart.update();

      this.fillSegments();
      this.outerHabitChart.data = {
        datasets: this.habitChartDataset,
        labels: this.outerLabels
      };

      this.outerHabitChart.update();
    }
  }
}
