<template>
  <div class="s-canvas">
    <canvas id="s-canvas" :width="contentWidth" :height="contentHeight" @click="handleClick"></canvas>
  </div>
</template>
<script>
export default {
  name: "IdentifyCode",
  data() {
    return {
      identifyCode: ""
    };
  },
  props: {
    fontSizeMin: {
      type: Number,
      default: 32
    },
    fontSizeMax: {
      type: Number,
      default: 40
    },
    backgroundColorMin: {
      type: Number,
      default: 180
    },
    backgroundColorMax: {
      type: Number,
      default: 240
    },
    colorMin: {
      type: Number,
      default: 50
    },
    colorMax: {
      type: Number,
      default: 160
    },
    lineColorMin: {
      type: Number,
      default: 40
    },
    lineColorMax: {
      type: Number,
      default: 180
    },
    dotColorMin: {
      type: Number,
      default: 0
    },
    dotColorMax: {
      type: Number,
      default: 255
    },
    contentWidth: {
      type: Number,
      default: 136
    },
    contentHeight: {
      type: Number,
      default: 48
    }
  },
  methods: {
    //点击生成随机数 并传给调用它的组件（父组件用changeCode接收）
    handleClick() {
      this.identifyCode = this.getRandomStr();
      let newN = this.identifyCode;
      this.$emit("changeCode", newN);
    },
    // 生成一个随机数
    randomNum(min, max) {
      return Math.floor(Math.random() * (max - min) + min);
    },
    getRandomStr() {
      let returnStr = ""; //返回的字符串
      let min = 4;
      //随机生成字符
      let autoGetStr = function() {
        let charFun = function() {
          let n = Math.floor(Math.random() * 62);
          if (n < 10) {
            return n; //1-10
          } else if (n < 36) {
            return String.fromCharCode(n + 55); //A-Z
          } else {
            return String.fromCharCode(n + 61); //a-z
          }
        };
        while (returnStr.length < 4) {
          returnStr += charFun();
        }
      };
      autoGetStr();
      return returnStr;
    },
    // 生成一个随机的颜色
    randomColor(min, max) {
      var r = this.randomNum(min, max);
      var g = this.randomNum(min, max);
      var b = this.randomNum(min, max);
      return "rgb(" + r + "," + g + "," + b + ")";
    },
    drawPic() {
      var canvas = document.getElementById("s-canvas");
      var ctx = canvas.getContext("2d");
      ctx.textBaseline = "bottom";
      // 绘制背景
      ctx.fillStyle = this.randomColor(
        this.backgroundColorMin,
        this.backgroundColorMax
      );
      ctx.fillRect(0, 0, this.contentWidth, this.contentHeight);
      // 绘制文字
      for (let i = 0; i < this.identifyCode.length; i++) {
        this.drawText(ctx, this.identifyCode[i], i);
      }
      this.drawLine(ctx);
      this.drawDot(ctx);
    },
    drawText(ctx, txt, i) {
      ctx.fillStyle = this.randomColor(this.colorMin, this.colorMax);
      ctx.font =
        this.randomNum(this.fontSizeMin, this.fontSizeMax) + "px SimHei";
      var x = (i + 1) * (this.contentWidth / (this.identifyCode.length + 1));
      var y = this.randomNum(this.fontSizeMax, this.contentHeight - 5);
      var deg = this.randomNum(-45, 45);
      // 修改坐标原点和旋转角度
      ctx.translate(x, y);
      ctx.rotate((deg * Math.PI) / 180);
      ctx.fillText(txt, 0, 0);
      // 恢复坐标原点和旋转角度
      ctx.rotate((-deg * Math.PI) / 180);
      ctx.translate(-x, -y);
    },
    drawLine(ctx) {
      // 绘制干扰线
      for (let i = 0; i < 8; i++) {
        ctx.strokeStyle = this.randomColor(
          this.lineColorMin,
          this.lineColorMax
        );
        ctx.beginPath();
        ctx.moveTo(
          this.randomNum(0, this.contentWidth),
          this.randomNum(0, this.contentHeight)
        );
        ctx.lineTo(
          this.randomNum(0, this.contentWidth),
          this.randomNum(0, this.contentHeight)
        );
        ctx.stroke();
      }
    },
    drawDot(ctx) {
      // 绘制干扰点
      for (let i = 0; i < 100; i++) {
        ctx.fillStyle = this.randomColor(0, 255);
        ctx.beginPath();
        ctx.arc(
          this.randomNum(0, this.contentWidth),
          this.randomNum(0, this.contentHeight),
          1,
          0,
          2 * Math.PI
        );
        ctx.fill();
      }
    }
  },
  watch: {
    identifyCode() {
      this.drawPic();
    }
  },
  mounted() {
    this.drawPic();
    this.handleClick();
  }
};
</script>