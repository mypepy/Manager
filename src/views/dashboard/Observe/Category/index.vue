<template>
  <el-card>
    <div slot="header" class="header">
      <div class="search-header">
        <span>销售额类别占比</span>
        <el-radio-group
          v-model="tabPosition"
          style="margin-bottom: 30px"
          size="mini"
        >
          <el-radio-button label="top">全部渠道</el-radio-button>
          <el-radio-button label="right">线上</el-radio-button>
          <el-radio-button label="bottom">门店</el-radio-button>
        </el-radio-group>
      </div>
    </div>
    <div class="main">
      <div class="charts" ref="charts"></div>
    </div>
  </el-card>
</template>

<script>
import echarts from "echarts";
export default {
  data() {
    return {
      tabPosition: "left",
    };
  },
  mounted() {
    let lineCharts = echarts.init(this.$refs.charts);
    // 配置数据
    lineCharts.setOption({
      tooltip: {
        trigger: "item",
      },
      legend: {
        top: "5%",
        left: "center",
      },
      series: [
        {
          name: "Access From",
          type: "pie",
          radius: ["40%", "70%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: "#fff",
            borderWidth: 2,
          },
          label: {
            show: false,
            position: "center",
          },
          emphasis: {
            label: {
              show: true,
              fontSize: "40",
              fontWeight: "bold",
            },
          },
          labelLine: {
            show: false,
          },
          data: [
            { value: 1048, name: "Search Engine" },
            { value: 735, name: "Direct" },
            { value: 580, name: "Email" },
            { value: 484, name: "Union Ads" },
            { value: 300, name: "Video Ads" },
          ],
        },
      ],
    });
  },
};
</script>

<style scoped>
.header {
  border-bottom: 1px solid #eee;

}
.search-header {
  display: flex;
  justify-content: space-between;

}
.charts {
  width: 700px;
  height: 200px;
}
</style>