<template>
  <div style="width:100%;height:100%;position:relative;">
    <ve-map
      v-bind="vscompt"
      width="100%"
      height="100%"
      :key="Math.random()"
      :data="{columns:(vscompt.comptData||{}).columns,rows:(vscompt.comptData||{}).rows}"
      :settings="vscompt.comptAttrs.setting"
      :events="vscompt.comptAttrs.chartEvents"
      :geo="vscompt.comptAttrs.extendSetting.geo"
      :series="vscompt.comptAttrs.extendSetting.series"
      :legend="vscompt.comptAttrs.extendSetting.legend"
      :title="vscompt.comptAttrs.extendSetting.title"
      :backgroundColor="vscompt.comptAttrs.extendSetting.backgroundColor"
      :grid="vscompt.comptAttrs.extendSetting.grid"
      :tooltip="vscompt.comptAttrs.extendSetting.tooltip"
      :after-config="afterConfig"
    ></ve-map>
    <!--       :visualMap="vscompt.comptAttrs.extendSetting.visualMap"
 -->
  <div style="position: absolute; top: 30px; left: 10px;">
    <div v-for="item in visualList" class="visual-list-item" :key="item.element_id">
      <div class="visual-item-tit">{{ (colSetting[item.element_id] || {})['series.index.name,legend.data.index'] || item.title }}</div>
      <div v-for="range in item.splitList" class="visual-range-item" :key="range.label">
        <b class="range-icon" :style="{'background-color': range.iconColor}" />
        <span>{{ range.label }}</span>
      </div>
    </div>
  </div>
    <div class="drill-label" v-show="vscompt.comptAttrs['curDrillIdx']||0 > 0" @click="toDrillData">
      {{vscompt.comptAttrs['drillWBeanList'] != undefined && vscompt.comptAttrs['drillWBeanList'].length>0 && vscompt.comptAttrs['curDrillIdx']||0 > 0?vscompt.comptAttrs['drillWBeanList'][vscompt.comptAttrs['curDrillIdx']||0].label:""}}
      <span
        v-show="vscompt.comptAttrs['drillWBeanList'] != undefined && vscompt.comptAttrs['drillWBeanList'].length>0&&vscompt.comptAttrs['curDrillIdx']||0>0"
        class="drill-icon icon-A10018_doubleArrowLeft"
      ></span>
    </div>
    <div
      class="drill-label link-reset"
      v-show="linkageState && vscompt.comptAttrs['mainLinkageData'] != undefined && vscompt.comptAttrs['mainLinkageData'].length>0"
      @click="resetLinage()"
    >
      <span class="icon-A10622_PreOffline" title="??????????????????"></span>
    </div>
  </div>
</template>

<script>
// ?????????????????? https://gallery.echartsjs.com/editor.html?c=xr1Ilwr5PO
// demo ????????????demo_???????????? ?????? ????????? ??????
import { mapState, mapActions } from "vuex";
import VisualmapMixin from '@component/template/mixins/VisualmapMixin';
import commonCompMixin from '@component/template/mixins/commonCompMixin';
// import 'echarts/lib/component/visualMap';
import {
  objDeepCopy,
  getRequestParam,
  addPageCondis,
  getLinkRequestParam,
  dataInterval,
  loadDataDone,
  loadDataError,
  formatNumber
} from "../../utils/comonFunc.js";
import { setTimeout } from "timers";
export default {
  props: ["vscompt"],
  mixins: [VisualmapMixin, commonCompMixin],
  data() {
    return {
      linkageState: false,
      area_name: "",
      colsTotal: {},
      columnsData: {},
      defaultColor: [
          "#19D4AE",
          "#5AB1EF",
          "#fa6e86",
          "#ffb980",
          "#0067a6",
          "#c4b4e4",
          "#d87a80",
          "#9cbbff",
          "#d9d0c7",
          "#87a997",
          "#d49ea2",
          "#5b4947",
          "#7ba3a8"
        ],
        // ??????watch???????????????mixins?????????????????????
        mixinsEffectOn: {
          isDSMapReady: false
        }
    };
  },
  mounted() {
    //????????????
    if (
      this.vscompt.comptAttrs.mapLevel == "1" &&
      (this.vscompt.comptAttrs.mapArea != "" ||
        this.vscompt.comptAttrs.mapArea != undefined)
    ) {
      this.vscompt.comptAttrs.setting["position"] =
        "province/" + this.vscompt.comptAttrs.mapArea;
    }

    if (this.vscompt.comptAttrs.curDrillIdx == undefined) {
      this.$set(this.vscompt.comptAttrs, "curDrillIdx", 0);
      this.$set(this.vscompt.comptAttrs, "drillWBeanList", []);
    }
    //??????????????????????????????geo.map
    if (
      this.vscompt.comptAttrs.mapLevel == "1" &&
      this.vscompt.comptAttrs.curDrillIdx == 0 &&
      this.vscompt.comptAttrs.setting.position != "" &&
      this.vscompt.comptAttrs.extendSetting.geo.map !=
        this.vscompt.comptAttrs.setting.position
    ) {
      this.vscompt.comptAttrs.extendSetting.geo.map = this.vscompt.comptAttrs.setting.position;
      this.vscompt.comptAttrs.extendSetting.series[0].data = [];
    }
    //????????????,pc????????????????????????
    if (['1001001','1001002'].includes(this.pageCache.classTypeId)) {
      //?????????????????????????????????
      this.$set(
        this.vscompt.comptAttrs.extendSetting.series[0].label.normal,
        "color",
        "#000"
      );
      //???????????????????????????
      this.$set(
        this.vscompt.comptAttrs.extendSetting.series[0].label.normal,
        "position",
        "bottom"
      );
      //??????????????????
      this.$set(
        this.vscompt.comptAttrs.extendSetting.geo.itemStyle.normal,
        "areaColor",
        "#F5F7FA"
      );
      //??????????????????????????????
      this.$set(
        this.vscompt.comptAttrs.extendSetting.geo.itemStyle.emphasis,
        "areaColor",
        "#ffdf33"
      );
      //??????????????????
      this.$set(
        this.vscompt.comptAttrs.extendSetting.legend.data[0].textStyle,
        "color",
        "#000"
      );
      //??????????????????
      this.$set(
        this.vscompt.comptAttrs.extendSetting.series[0].itemStyle,
        "color",
        "#1be9bf"
      );
      //??????????????????
      // if(this.vscompt.styleAttrs[1].children[0].value == ''){
      //   this.$set(this.vscompt.comptAttrs.extendSetting.legend, "show", true);
      //   for(var i=0;i<5;i++){
      //     this.$set(
      //       this.vscompt.styleAttrs[1].children[0].options[i],
      //       "isSelected",
      //       i == 3 ? true : false
      //     );
      //   }
      // }
    }

    var that = this;
    this.vscompt.comptAttrs.chartEvents = {
      click: function(e) {
        if (
          that.isCanDrill &&
          that.vscompt.comptAttrs.curDrillIdx <
            that.drillData.length - 1
        ) {
          that.area_name = e.name;
          let mapName = e.name.replace(/(['???',('??????')])/gi, "");
          that.vscompt.comptAttrs.extendSetting.geo["map"] = mapName;
          if (that.vscompt.comptAttrs.curDrillIdx == 0) {
            that.vscompt.comptAttrs.drillWBeanList = [];
            that.vscompt.comptAttrs.drillWBeanList.push({
              item: objDeepCopy(that.vscompt.comptAttrs.xAxisData[0]),
              whereBean: objDeepCopy(that.vscompt.comptAttrs.whereBean),
              label: ""
            });
          }
          //????????????????????????????????????
          that.vscompt.comptAttrs.extendSetting.series[0].data = [];
          that.vscompt.comptAttrs.extendSetting.series[1].data = [];
          //?????????????????????
          if (that.vscompt.comptAttrs.mapLevel == "1") {
            let mapJson = require("@/../public/echarts-map-geo/city/" +
              mapName);
            that.$echarts.registerMap(mapName, mapJson);
          }
          that.queryData({ isDownDrill: true, label: e.name });
        }
        if (
          (that.vscompt.comptAttrs.mainLinkageData.length > 0 ||
            that.isPageLinkSet) &&
          that.isLinkageCondi(e.name)
        ) {
          that.linkageState = true;
          that.setLinkageCondi({
            label: e.name,
            xAxisData: that.xAxisData,
            vscompt: that.vscompt,
            isJumpNewPage: true
          });
        }
        if (!that.vscompt.comptAttrs.mainLinkageData || that.vscompt.comptAttrs.mainLinkageData.length === 0 || that.drillData.length === 0) {
          that.gotoPage(that.vscompt.comptAttrs.extendSetting);
        }
      }
    };
    if (this.isRegisterMap) {
      let mapJson = require("@/../public/echarts-map-geo/city/" +
        this.vscompt.comptAttrs.extendSetting.geo.map);
      this.$echarts.registerMap(
        this.vscompt.comptAttrs.extendSetting.geo.map,
        mapJson
      );
    }
    // ????????????????????????????????? ??????????????????????????????????????????2????????????
    this.vscompt.comptAttrs.extendSetting.series[0].symbolSize = this.symbolSizeFunc;
    // ????????????????????????????????? ??????????????????????????????????????????1????????????
    this.vscompt.comptAttrs.extendSetting.series[0].itemStyle.color = this.scatterColorFunc;
    this.vscompt.comptAttrs.extendSetting.tooltip = {
      trigger: 'item',
      formatter: this.tooltipFormatter
    }
    // this.$once('hook:beforeDestroy',() => {
    //   this.vscompt.comptAttrs.extendSetting.tooltip.formatter = null;
    //   this.vscompt.comptAttrs.extendSetting.series[0].itemStyle.color = null;
    //   this.vscompt.comptAttrs.extendSetting.series[0].symbolSize = null;
    // });
  },
  computed: {
    ...mapState({
      isDSMapReady: state => state.AnalyReportAttr.isDSMapReady,
      datasetMap: state => state.AnalyReportAttr.datasetMap,
      linkStack: state => state.PageDesign.linkStack,
      pageCache: state => state.HomeBody.pageCache
    }),
    // isCanDrill() {
    //   return this.vscompt.comptAttrs.drillData.length > 1;
    // },
    // // xAxisData() {
    // //   var result = [];
    // //   if (this.vscompt.comptAttrs.xAxisData.length > 0) {
    // //     result =
    // //       constructList(this.vscompt.comptAttrs.xAxisData, this.datasetMap, this.vscompt.comptAttrs.computedData || [])
    // //         .resultList || [];
    // //   }
    // //   return result;
    // // },
    // // yAxis1Data() {
    // //   var result = [];
    // //   if (this.vscompt.comptAttrs.yAxis1Data.length > 0) {
    // //     result =
    // //       constructList(this.vscompt.comptAttrs.yAxis1Data, this.datasetMap, this.vscompt.comptAttrs.computedData || [])
    // //         .resultList || [];
    // //   }
    // //   return result;
    // // },
    // // yAxis2Data() {
    // //   var result = [];
    // //   if (this.vscompt.comptAttrs.yAxis2Data.length > 0) {
    // //     result =
    // //       constructList(this.vscompt.comptAttrs.yAxis2Data, this.datasetMap, this.vscompt.comptAttrs.computedData || [])
    // //         .resultList || [];
    // //   }
    // //   return result;
    // // },
    // // drillData() {
    // //   var result = [];
    // //   if (this.vscompt.comptAttrs.drillData.length > 0) {
    // //     result =
    // //       constructList(this.vscompt.comptAttrs.drillData, this.datasetMap, this.vscompt.comptAttrs.computedData || [])
    // //         .resultList || [];
    // //   }
    // //   return result;
    // // },
    // isPageLinkSet() {
    //   return (
    //     this.vscompt.comptAttrs["pageLinkageData"] != undefined &&
    //     this.vscompt.comptAttrs["pageLinkageData"].length > 0
    //   );
    // },
    isRegisterMap() {
      //???????????????????????????????????????????????????echarts.isRegisterMap
      return (
        this.vscompt.comptAttrs.mapLevel == "1" &&
        this.vscompt.comptAttrs.curDrillIdx == 1 &&
        this.vscompt.comptAttrs.extendSetting.geo.map != ""
      );
    },
    // ???????????????
    maxMeasureVal() {
      let result = 0;
      const { columns, rows } = this.vscompt.comptData;
      const secColName = columns[1];
      if (secColName) {
        (rows || []).forEach(item => {
          result = Math.max(result, Number(item[secColName]) || 0);
        });
      }
      return result;
    },
    // ????????????????????????
    isAreaNameShow() {
      return this.vscompt.styleAttrs[1].children.find(item => item.enName === "series.index.name.normal.show").value;
    },
    colsTotalAndData() {
      let columns = (this.vscompt.comptData || {}).columns || [];
      let array = (this.vscompt.comptData || {}).rows || [];
      let colsTotal = {};//??????
      let colsData = {};//??????????????????????????????
      for (var i = 0; i < columns.length; i++) {
        let result = 0;
        let col = {};
        for (var j = 0; j < array.length; j++) {
          result += parseFloat(array[j][columns[i]]);
          col[array[j][columns[0]]] = parseFloat(array[j][columns[i]]);
        }
        colsTotal[columns[i]] = result;
        colsData[columns[i]] = col;
      }
      return {
        colsTotal: colsTotal,
        colsData: colsData
      };
    },
    // ????????????????????????
    isColorMeasureExist() {
      return this.yAxis1Data.some(item => item.isNewSetting === 'colorMeasure');
    },
    // ????????????????????????
    isSizeMeasureExist() {
      return this.yAxis1Data.some(item => item.isNewSetting === 'sizeMeasure');
    },
    colSetting() {
      return this.vscompt.comptAttrs.colSetting;
    }
  },
  watch: {
    isDSMapReady: {
      immediate: true, // immediate????????????????????????????????????
      handler(newVal, oldVal) {
        if (this.vscompt.comptAttrs.curDrillIdx == undefined) {
          this.$set(this.vscompt.comptAttrs, "curDrillIdx", 0);
          this.$set(this.vscompt.comptAttrs, "drillWBeanList", []);
        }
        if (this.vscompt.comptData == undefined) {
          this.$set(this.vscompt, "comptData", {
            columns: [],
            rows: []
          });
          this.$set(this.vscompt.comptAttrs, "isNeedRestDrill", 0);
        }
        if (this.vscompt.comptAttrs.isResetSeriesData != 0) {
          this.$set(this.vscompt.comptAttrs, "isResetSeriesData", 0);
        }
        //???????????????????????????????????????????????????
        if (
          this.vscompt.comptAttrs.extendSetting["legend.selected"] != undefined
        ) {
          let selectedObj = this.vscompt.comptAttrs.extendSetting[
            "legend.selected"
          ];
          for (let key in selectedObj) {
            selectedObj[key] = true;
          }
        }
        //???/????????????????????????????????????json
        let mapLevel = this.vscompt.comptAttrs.mapLevel
        if (mapLevel === "1" || mapLevel === "2") {
          let mapName = mapLevel === '1' ? this.vscompt.comptAttrs.mapArea : this.vscompt.comptAttrs.mapArea.replace(/(['???',('??????')])/gi, "");
          const geoJson = require("@/../public/echarts-map-geo/"+ (mapLevel === '1' ? "province/" : "city/") + mapName + ".json");
          this.$echarts.registerMap((mapLevel === '1' ? "province/" : "") + mapName,geoJson);
        }
        if (
          newVal &&
          this.vscompt.afId != "" &&
          this.vscompt.comptData.columns.length == 0
        ) {
          if (this.linkStack.length > 0 && this.vscompt.comptAttrs.isLinkage) {
            let param = [];
            for (let item of this.linkStack) {
              if (item.comptId == this.vscompt.comptId) {
                param = item.param;
                break;
              }
            }
            if (param.length > 0) {
              this.queryLinkData(param);
            } else {
              this.queryData();
            }
          } else {
            this.queryData();
          }
        }
        if (this.pageCache.operation == "preview"){ //????????????
          let time=this.vscompt.comptAttrs.extendSetting.timerValue;
          dataInterval(time,this.queryData,this.vscompt.comptAttrs.extendSetting);
        }
      }
    },
    "vscompt.comptAttrs.isNeedRestDrill": {
      immediate: true,
      handler(newVal, oldVal) {
        if (newVal > 0) {
          this.vscompt.comptAttrs.curDrillIdx = 0;
          this.vscompt.comptAttrs.drillWBeanList = [];
        }
      }
    },
    measureValRange(newVal) {
      let visualMap = this.vscompt.comptAttrs.extendSetting.visualMap;
      const [colorMeasureName, sizeMeasureName] = ((this.vscompt.comptData || {}).columns || ['', '', '']).slice(1);
      // visualMap[0],visualMap[1] ?????????1?????????????????????????????????
      visualMap[0].pieces[0].label = colorMeasureName;
      visualMap[2].pieces[0].label = sizeMeasureName;
      for (let index = 0; index < newVal.length; index++) {
        const [min, max] = newVal[index];
        const visualIndex = index === 0 ? 1 : 3;
        visualMap[visualIndex].min = min;
        visualMap[visualIndex].max = max;
        if (min !== max && index === 0) {
          const splitList = this.initSplitList(newVal[index]);
          visualMap[visualIndex].pieces = splitList;
        }
        if (index === 1) {
          visualMap[visualIndex].pieces = [{
            "label": `${formatNumber(min, 2)} ??? ${formatNumber(max, 2)}`
          }];
        }
      }
    },
    isAreaNameShow(newVal) {
      this.$set(this.vscompt.comptAttrs.extendSetting.series[0].label.normal, 'show', !!newVal);
    }
  },
  methods: {
    tooltipFormatter(params) {
      const { colsData } = this.colsTotalAndData;
      const { marker, name } = params;
      let res =  `${marker} ${name}<br/>`;
      const colSetting = this.colSetting;
      for (let i = 0, length = (this.yAxis1Data || []).length; i < length; i++) {
        const { nick_name, element_id } = this.yAxis1Data[i];
        const measureName = (colSetting[element_id] || {})['series.index.name,legend.data.index'] || nick_name
        res += `${measureName}???${colsData[nick_name][name] || '--'}<br/>`
      }
      return res;
    },
    // ????????????????????????
    scatterColorFunc(params) {
      let color = '#ccc';
      // ??????????????????????????????????????????
      if (!this.isColorMeasureExist) {
        return color;
      }
      color = '#19D4AE';
      const { name } = params; // ????????????
      // ????????????????????????
      const visualMap = this.vscompt.comptAttrs.extendSetting.visualMap[1];
      const {
        pieces
      } = visualMap;
      // ???????????? ???mixins
      const symbolColorArr = this.defaultColor;
      // ????????????????????????
      const colorMeasure = ((this.vscompt.comptData || {}).columns || [])[1] || '';
      if (!colorMeasure || (pieces || []).length === 0) {
        return color;
      }
      // ???????????????????????????
      const colorColsData = (this.colsTotalAndData.colsData || {})[colorMeasure];
      if (!colorColsData || !colorColsData[name] || colorColsData[name] == 0 || !Number(colorColsData[name])) {
        // ????????? ??????????????? ???????????????
        color = '#fff';
        return color;
      }
      // ?????????????????????
      const measureVal = Number(colorColsData[name]);
      for (let index = 0; index < pieces.length; index++) {
        const {
          gte,
          lte
        } = pieces[index];
        if (measureVal >= gte && measureVal <= lte) {
          // ???????????????????????????
          color = symbolColorArr[index];
          break;
        }
      }
      return color;
    },
    // ????????????????????????
    symbolSizeFunc(val, params) {
      // ?????????????????????????????????????????????
      const basicSize = 5;
      if (!this.isSizeMeasureExist) {
        return basicSize;
      }
      const cityName = params.name;   
      const sizeMeasure = this.yAxis1Data.find(item => item.isNewSetting === 'sizeMeasure').nick_name || ''; 
      const maxSize = 25;
      if (!sizeMeasure) {
        return basicSize;
      }
      const sizeColsData = (this.colsTotalAndData.colsData || {})[sizeMeasure];
      if (!sizeColsData || !sizeColsData[cityName] || sizeColsData[cityName] == 0 || !Number(sizeColsData[cityName])) {
        return basicSize;
      }

      const measureVal = Number(sizeColsData[cityName]);
      if (!measureVal) {
        return basicSize;
      }

      // ??????????????????????????????????????????
      const [min, max] = this.measureValRange[this.yAxis1Data.length - 1];
      // ????????????
      const valRange = max - min;
      // ???????????????
      const SizeRange = maxSize - basicSize;
      const size = basicSize + parseInt((measureVal - min)/ valRange * SizeRange);
      return size || 5;
    },
    queryData(param) {
      let params = getRequestParam({
        param: param,
        vscompt: this.vscompt,
        drillData: this.drillData,
        xAxisData: this.xAxisData,
        yAxis1Data: this.yAxis1Data,
        yAxis2Data: this.yAxis2Data,
        dataType: 3,
        datasetMap: this.datasetMap
      });
      if (param != undefined && param.isUpDrill) {
        this.vscompt.comptAttrs.extendSetting.series[0].data = [];
        this.vscompt.comptAttrs.extendSetting.series[1].data = [];
        require("@/../public/echarts-map-geo/province/" +
          this.vscompt.comptAttrs.mapArea);
        this.vscompt.comptAttrs.extendSetting.geo["map"] =
          "province/" + this.vscompt.comptAttrs.mapArea;
      }
      params['mapArea'] = this.vscompt.comptAttrs.mapArea;
      if(param && param.isDownDrill){
        params['mapArea'] = this.area_name;
      }
      this.executeReqest(params);
    },
    executeReqest(params) {
      params = addPageCondis({
        vscompt: this.vscompt,
        params: params,
        datasetMap: this.datasetMap
      });
      var _this = this;
      this.vscompt.comptAttrs.loading = true;
      let computedData = this.computedData||[];
      this.queryComptData({ params, computedData })
        .then(function(response) {
          if (response.data.respResult == 1) {
            let comptData = response.data.respData;
            if (
              comptData.columns != undefined &&
              comptData.columns.length > 0 &&
              comptData.columns.indexOf("XXXXCODE") > -1
            ) {
              comptData.columns.pop();
            }
            if (comptData.rows == null || comptData.rows == undefined) {
              comptData.rows = [];
            }
            if (comptData.columns == null || comptData.columns == undefined) {
              comptData.columns = [];
            }
            _this.vscompt.comptData = comptData;
            _this.resetGeo();
            // _this.getColsTotalAndData();
            _this.resetMapScatterData();
            let extend = _this.vscompt.comptAttrs.extendSetting;
            let scaData = extend.series[0];
            //???????????????data???null????????????????????? ??????????????????????????????data,????????????????????????value[2]
            if (
              scaData == undefined ||
              scaData.data == null ||
              scaData.data.length == 0 ||
              scaData.data[0].value == undefined ||
              scaData.data[0].value.length < 3 ||
              (
                params.afQueryBean.where_bean != null &&
                params.afQueryBean.where_bean.exp != "" &&
                params.afQueryBean.where_bean.rule_list.length > 0)
            ) {
              let mapName = "";
              if (
                _this.vscompt.comptAttrs.mapLevel == "1" &&
                _this.vscompt.comptAttrs.curDrillIdx == 0
              ) {
                mapName = "province/" + _this.vscompt.comptAttrs.mapArea;
              } else if (
                _this.vscompt.comptAttrs.mapLevel == "2" ||
                _this.vscompt.comptAttrs.curDrillIdx == 1
              ) {
                mapName = _this.area_name.replace(/(['???',('??????')])/gi, "");
              }
              let mapJson = _this.$echarts.getMap(mapName);
              let features =
                mapJson == null ? [] : (mapJson.geoJson || {}).features;
              //????????????
              let properties = {};
              let seriesData =
                _this.columnsData[
                  _this.vscompt.comptData.columns[1]
                ];
              // let maxData = { column: "", result: 0 };
              //??????data
              let scatterData = [];
              for (var i = 0; i < features.length; i++) {
                properties[features[i].properties.name] =
                  features[i].properties.cp;
                //set????????????
                scatterData.push({
                  name: features[i].properties.name,
                  value: [...features[i].properties.cp]
                });
                //set??????data
                if (seriesData != null && seriesData != {}) {
                  scatterData[i].value[2] =
                    seriesData[features[i].properties.name];
                } 
              }
              //????????????
              extend.series[0].data = scatterData;
              extend.series[0].name = extend.legend.data[0]||{}.name ? extend.legend.data[0]||{}.name : _this.vscompt.comptData.columns[1];
              //???????????????
              // if (
              //   extend["series.0.markPoint"] &&
              //   seriesData != null &&
              //   seriesData != {} &&
              //   maxData.column != ""
              // ) {
              //   properties[maxData.column].push(maxData.result);
              //   extend.series[2].data = [];
              //   extend.series[2].data.push({
              //     name: maxData.column,
              //     value: properties[maxData.column]
              //   });
              // }
              // //???????????????????????????????????????data??????
              // if (extend.series[0].label.normal.show)
              //   _this.ResetScatterSeriesData({
              //     vscompt: _this.vscompt,
              //     colsTotal: _this.colsTotal,
              //     columnsData: _this.columnsData
              //   });
            }
            // _this.setAnotherName(_this.vscompt);
            loadDataDone(_this.vscompt);
          } else {
            loadDataError(_this.vscompt,'??????????????????');
            // _this.$message.error("??????????????????");
            console.error(response.data.respErrorDesc);
          }
        })
        .catch(function(error) {
          console.error(error);
          // _this.$message.error("??????????????????");
        })
        .finally(() => {
          _this.vscompt.comptAttrs.loading = false;
        });
    },
    ...mapActions({
      queryComptData: "QueryTable/queryComptData",
      setLinkageCondi: "PageDesign/setLinkageCondi",
      setAreaMapSeriesData: "PageDesign/setAreaMapSeriesData",
      ResetScatterSeriesData: "PageDesign/ResetScatterSeriesData",
      gotoPage: "PageDesign/gotoPage",
      setAnotherName: "PageDesign/setAnotherName"
    }),
    toDrillData() {
      this.queryData({ isUpDrill: true });
    },
    queryLinkData(linkageCondi) {
      let params = getLinkRequestParam({
        linkageCondi: linkageCondi,
        vscompt: this.vscompt,
        xAxisData: this.xAxisData,
        yAxis1Data: this.yAxis1Data,
        yAxis2Data: this.yAxis2Data,
        dataType: 3
      });
      this.executeReqest(params);
    },
    resetLinage() {
      this.setLinkageCondi({
        label: "",
        xAxisData: this.xAxisData,
        vscompt: this.vscompt,
        isJumpNewPage: false
      });
      this.linkageState = false;
    },
    // getColsTotalAndData() {
    //   let columns = (this.vscompt.comptData || {}).columns || [];
    //   let array = (this.vscompt.comptData || {}).rows || [];
    //   for (var i = 1; i < columns.length; i++) {
    //     let result = 0;
    //     let col = {};
    //     for (var j = 0; j < array.length; j++) {
    //       result += parseFloat(array[j][columns[i]]);
    //       col[array[j][columns[0]]] = parseFloat(array[j][columns[i]]);
    //     }
    //     this.colsTotal[columns[i]] = result;
    //     this.columnsData[columns[i]] = col;
    //   }
    // },
    isLinkageCondi(areaName) {
      let areaExist = false;
      let columns = (this.vscompt.comptData || {}).columns || [];
      let rows = (this.vscompt.comptData || {}).rows || [];
      for (var i = 0; i < rows.length; i++) {
        if (areaName == rows[i][columns[0]]) {
          areaExist = true;
          break;
        }
      }
      //????????????????????????????????????????????????????????????????????????????????????????????????
      if (
        this.vscompt.comptAttrs.linkageCondi != undefined &&
        this.vscompt.comptAttrs.linkageCondi.length > 0 &&
        areaExist
      ) {
        return true;
      }
      if (
        this.vscompt.comptAttrs.mainLinkageData != undefined &&
        this.vscompt.comptAttrs.mainLinkageData.length > 0 &&
        areaExist
      ) {
        return true;
      }
      if(this.vscompt.comptAttrs.pageLinkageData != undefined && this.vscompt.comptAttrs.pageLinkageData.length >0 && areaExist){
        return true;
      }
      return false;
    },
    // reSetAreaMapSeriesData() {
    //   //???????????????
    //   let dataLab =
    //     this.vscompt.comptAttrs.extendSetting[
    //       "series.0.label.normal.map.show"
    //     ] || false;
    //   //??????
    //   let areaName = this.vscompt.styleAttrs[1].children[1].value || false;
    //   let formatter = dataLab
    //     ? areaName
    //       ? "function(params){return (params.value[2]==undefined ? '-' : params.value[2])+'\\n'+params.name }"
    //       : "function(params){return params.value[2]==undefined ? '-' : params.value[2]}"
    //     : areaName
    //     ? "function(params){return params.name}"
    //     : "";
    //   if (formatter == "") {
    //     this.vscompt.comptAttrs.extendSetting.series[0].label.normal.show = false;
    //   } else {
    //     this.vscompt.comptAttrs.extendSetting.series[0].label.normal.formatter = eval(
    //       "(" + formatter + ")"
    //     );
    //     this.vscompt.comptAttrs.extendSetting.series[0].label.normal.show = false;
    //     this.vscompt.comptAttrs.extendSetting.series[0].label.normal.show = true;
    //   }
    // },
    resetMapScatterData() {
      //??????scatter??????
      // let type = this.vscompt.type;
      let mapArea = this.vscompt.comptAttrs.mapArea;
      let mapLevel = this.vscompt.comptAttrs.mapLevel;
      let mapJson = this.$echarts.getMap(
        mapLevel == "1"
          ? this.drillData.length == 0
            ? "province/" + mapArea
            : this.vscompt.comptAttrs.extendSetting.geo.map
          : mapArea.replace(/(['???',('??????')])/gi, "")
      );
      let features = mapJson == null ? [] : (mapJson.geoJson || {}).features;
      let scatterData = [];
      //????????????
      let properties = {};
      for (var i = 0; i < features.length; i++) {
        properties[features[i].properties.name] = features[i].properties.cp;
        scatterData.push({
          name: features[i].properties.name,
          value: features[i].properties.cp
        });
        if (
          this.vscompt.comptData.rows == null ||
          this.vscompt.comptData.rows.length == 0
        ) {
          scatterData[i].value[2] = "-";
        }
      }
      // if(type === "VeAreaMap"){
        //???????????????????????????
        // let styleIndex = 2;
        let seriesName = this.vscompt.comptData.columns[1];
        // let colsData = (this.getColsTotalAndData.colsData || {})[seriesName];
        let colsData = (this.columnsData || {})[seriesName];
        //?????????????????????????????????????????????data.value[2]
        if (
          this.vscompt.comptData.rows != null &&
          this.vscompt.comptData.rows.length > 0
        ) {
          //?????????
          // let decimal = this.vscompt.styleAttrs[styleIndex].children[4].value;
          // let tolCount = this.getColsTotalAndData.colsTotal[seriesName];
          // let tolCount = (this.colsTotal || {})[seriesName];
          //??????????????????
          // let smooth = this.vscompt.styleAttrs[styleIndex].children[3].value;
          // eval("smooth=" + this.vscompt.styleAttrs[styleIndex].children[3].value);
          for (let i = 0; i < scatterData.length; i++) {
            for (let key in colsData) {
              if (key == scatterData[i].name) {
                scatterData[i].value[2] = colsData[key] || 0;
                break;
              }
            }
          }
        }
        this.vscompt.comptAttrs.extendSetting.series[0].data = scatterData;

       
        //????????????
        // let legendName =
        //   this.vscompt.comptAttrs.extendSetting.legend.data[0]["name"] != ""
        //     ? this.vscompt.comptAttrs.extendSetting.legend.data[0]["name"]
        //     : this.vscompt.comptData.columns[1];
        // this.vscompt.comptAttrs.extendSetting.series[0].name = legendName;
        // this.vscompt.comptAttrs.extendSetting.legend.data[0][
        //   "name"
        // ] = legendName;

      // }
    },
    resetGeo() {
      let newData = this.vscompt;
      let mapLevel = newData.comptAttrs.mapLevel;
      let mapArea = newData.comptAttrs.mapArea;
      //?????????????????????????????????????????????
      let extend = newData.comptAttrs.extendSetting;
          extend.series[0].data = [];
          extend.series[1].data = [];
          extend.series = extend.series.splice(0,3);//???????????????lines
        delete extend['series.0.label.normal.show'];
        //??????
        if (mapLevel === "0" && mapArea != "") {
          const geoJSON = require("@/../public/echarts-map-geo/china.json");
          newData.comptAttrs.setting["position"] = "china";
          if (['VeAreaMap', 'VeLines'].includes(newData.type)) {
            extend.geo["map"] = "china";
          }
          newData.comptAttrs.setting['mapOrigin'] = geoJSON;
        }
        //??????
        if (
          mapLevel == "1" &&
          mapArea != "" &&
          newData.comptAttrs.curDrillIdx == 0
        ) {
          const geoJSON = require("@/../public/echarts-map-geo/province/" +
            mapArea + ".json");
          this.$echarts.registerMap("province/" +mapArea, geoJSON);
          extend.geo["map"] = "province/" + mapArea;
          newData.comptAttrs.setting["position"] = "province/" + mapArea;
          newData.comptAttrs.setting['mapOrigin'] = geoJSON;
        }
        //??????
        if (
          mapLevel == "2" &&
          mapArea &&
          newData.comptAttrs.curDrillIdx == 0
        ) {
          if (newData.type == "VeMap") {
            extend["series"] = {
              type: "map",
              map: mapArea.replace(/(['???',('??????')])/gi, "")
            };
          } else{
            extend.geo["map"] = mapArea.replace(/(['???',('??????')])/gi, "");
          }
          const geoJSON = require("@/../public/echarts-map-geo/city/" +
            mapArea.replace(/(['???',('??????')])/gi, "") +
            ".json");
          this.$echarts.registerMap(
            mapArea.replace(/(['???',('??????')])/gi, ""),
            geoJSON
          );
          newData.comptAttrs.setting['mapOrigin'] = geoJSON;
        }
        //???????????????
        if (
          mapLevel == "1" &&
          newData.comptAttrs.curDrillIdx == 1 &&
          newData.comptAttrs.drillData.length > 1
        ) {
          const geoJSON = require("@/../public/echarts-map-geo/city/" +
            extend.geo["map"]);
          this.$echarts.registerMap(extend.geo["map"], geoJSON
          );
          newData.comptAttrs.setting['mapOrigin'] = geoJSON;
        }
    },
    afterConfig(options) {
      if (!options.series[0].itemStyle || !options.series[0].itemStyle.color) {
        options.series[0]['itemStyle'] = {
          color: this.scatterColorFunc
        }
      }
      // ????????????????????????symbolsize????????????????????????
      if (typeof options.series[0].symbolSize !== 'function') {
        options.series[0]['symbolSize'] = this.symbolSizeFunc;
      }
      // options['visualMap'] = this.vscompt.comptAttrs.extendSetting.visualMap;
      return options;
    }
  }
};
</script>
<style lang="scss" scoped>
.drill-label {
  position: absolute;
  left: 5px;
  bottom: 3px;
  cursor: pointer;
  z-index: 100;
  .drill-icon {
    font-size: 12px;
    vertical-align: -1px;
  }
  &:hover {
    color: #409cfb;
  }
}
.link-reset {
  left: 5px;
  bottom: 2px;
}
</style>
