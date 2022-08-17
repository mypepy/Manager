<template>
  <div>
    <el-form ref="form" label-width="80px" :model="spu">
      <el-form-item label="spu名称">
        <el-input placeholder="请输入SPU名称" v-model="spu.spuName"></el-input>
      </el-form-item>
      <el-form-item label="品牌">
        <el-select placeholder="请选择品牌" v-model="spu.tmId">
          <el-option
            :label="tm.tmName"
            :value="tm.id"
            v-for="(tm, index) in tradeMarkList"
            :key="tm.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="SPU描述">
        <el-input
          type="textarea"
          placeholder="请输入SPU描述"
          rows="4"
          v-model="spu.description"
        ></el-input>
      </el-form-item>
      <el-form-item label="SPU图片">
        <!-- 上传图片： list-type：文件列表类型 file-list:照片墙展示的数据（数组）-->
        <!--  :on-preview:图片预览 -->
        <!-- :on-remove：照片墙删除图片 -->
        <el-upload
          action="/dev-api/admin/product/fileUpload"
          list-type="picture-card"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
          :file-list="spuImageList"
          :on-success="handlerSuccess"
        >
          <i class="el-icon-plus"></i>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt="" />
        </el-dialog>
      </el-form-item>
      <el-form-item label="销售属性">
        <el-select
          :placeholder="`还有${unSelectSaleAttr.length}个未选择`"
          v-model="attrIdAndName"
        >
          <el-option
            :label="unSelect.name"
            :value="`${unSelect.id}:${unSelect.name}`"
            v-for="(unSelect, index) in unSelectSaleAttr"
            :key="unSelect.id"
          ></el-option>
        </el-select>
        <el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="!attrIdAndName"
          @click="addSaleAttr"
          >添加销售属性</el-button
        >
        <el-table border style="width: 100%" :data="spu.spuSaleAttrList">
          <el-table-column type="index" label="序号" width="80" align="center">
          </el-table-column>
          <el-table-column prop="saleAttrName" label="属性名" width="width">
          </el-table-column>
          <el-table-column prop="prop" label="属性值名称列表" width="width">
            <template slot-scope="{ row, $index }">
              <el-tag
                :key="tag.id"
                v-for="(tag, index) in row.spuSaleAttrValueList"
                closable
                :disable-transitions="false"
                @close="row.spuSaleAttrValueList.splice(index, 1)"
              >
                {{ tag.saleAttrValueName }}
              </el-tag>
              <el-input
                class="input-new-tag"
                v-if="row.inputVisible"
                v-model="row.inputValue"
                ref="saveTagInput"
                size="small"
                @blur="handleInputConfirm(row)"
                @keyup.enter.native="handleInputConfirm(row)"
              >
              </el-input>
              <el-button
                v-else
                class="button-new-tag"
                size="small"
                @click="addSaleAttrValue(row)"
                >添加</el-button
              >
            </template>
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="width">
            <template slot-scope="{ row, $index }">
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="spu.spuSaleAttrList.splice($index, 1)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="addOrUpdateSpu">保存</el-button>
        <el-button @click="cancle">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import router from "@/router";
export default {
  name: "SpuForm",
  data() {
    return {
      dialogImageUrl: "",
      dialogVisible: false,
      spu: {
        // 三级分类id
        category3Id: 0,
        // 描述
        description: "",
        // spu名称
        spuName: "",
        // 品牌id
        tmId: "",
        // 收集spu图片信息
        spuImageList: [
          {
            // id: 0,
            // imgName: "",
            // imgUrl: "",
            // spuId: 0,
          },
        ],
        // 收集平台属性和属性值
        spuSaleAttrList: [
          // {
          //   baseSaleAttrId: 0,
          //   id: 0,
          //   saleAttrName: "",
          //   spuId: 0,
          //   spuSaleAttrValueList: [
          //     {
          //       baseSaleAttrId: 0,
          //       id: 0,
          //       isChecked: "",
          //       saleAttrName: "",
          //       saleAttrValueName: "",
          //       spuId: 0,
          //     },
          //   ],
          // },
        ],
      }, //存储spu信息
      tradeMarkList: [], //存储品牌信息
      spuImageList: [], //存储图片数据
      saleAttrList: [], //销售属性数据
      attrIdAndName: "", //未选择的销售属性的id
    };
  },
  methods: {
    handleRemove(file, fileList) {
      // 照片墙删除某个图片触发
      // file 删除的那张图，fileList 剩下的图
      //  收集照片墙图片数据
      this.spuImageList = fileList;
    },
    // 照片墙图片上传成功回调
    handlerSuccess(response, file, fileList) {
      // 收集图片信息
      console.log(response, file, fileList);
      this.spuImageList = fileList;
      console.log(this.spuImageList)
    },
    // 照片墙图片预览回调
    handlePictureCardPreview(file) {
      // 将图片地址赋给这个属性
      this.dialogImageUrl = file.url;
      // 对话框显示
      this.dialogVisible = true;
    },
    // 初始化spuForm数据
    async initSpuData(spu) {
      //  获取spu信息的数据
      let spuResult = await this.$API.spu.reqSpu(spu.id);
      if (spuResult.code == 200) {
        this.spu = spuResult.data;
      }
      // 获取品牌信息
      let radeMarkResult = await this.$API.spu.reqTradeMarkList();
      if (radeMarkResult.code == 200) {
        this.tradeMarkList = radeMarkResult.data;
      }
      // 获取图片信息
      let spuImageResult = await this.$API.spu.reqSpuImageList(spu.id);
      if (spuImageResult.code == 200) {
        this.listArr = spuImageResult.data;
        // 由于照片墙显示需要数组，所以需要处理一下返回的数据
        this.listArr.forEach((item) => {
          item.name = item.imgName;
          item.url = item.imgUrl;
        });
        this.spuImageList = this.listArr;
      }
      // 获取平台销售属性信息
      let saleResult = await this.$API.spu.reqBaseSaleAttrList();
      if (saleResult.code == 200) {
        this.saleAttrList = saleResult.data;
      }
    },
    // 添加新的销售属性
    addSaleAttr() {
      // 把收集的销售属性进行分割
      const [baseSaleAttrId, saleAttrName] = this.attrIdAndName.split(":");
      // 向spu对象的spuSaleAttrList添加新的销售属性
      let newSaleAttr = {
        baseSaleAttrId,
        saleAttrName,
        spuSaleAttrValueList: [],
      };
      this.spu.spuSaleAttrList.push(newSaleAttr);
      this.attrIdAndName = "";
    },
    // 添加按钮回调
    addSaleAttrValue(row) {
      this.$set(row, "inputVisible", true);
      this.$set(row, "inputValue", "");
    },
    // 属性值失去焦点
    handleInputConfirm(row) {
      // 解构出销售属性中收集的数据
      const { baseSaleAttrId, inputValue } = row;
      if (inputValue.trim() == "") {
        this.$message("属性值不能为空");
        return;
      }
      let result = row.spuSaleAttrValueList.every(
        (item) => item.saleAttrValueName != inputValue
      );
      if (!result) {
        this.$message("属性值不能相同");
        return;
      }
      let newSaleAttrValue = { baseSaleAttrId, saleAttrValueName: inputValue };
      row.spuSaleAttrValueList.push(newSaleAttrValue);
      row.inputVisible = false;
    },
    // 提交spu回调
    async addOrUpdateSpu() {
      // 整理参数--照片墙
      // 对于图片，需携带imgUrl和imgName
      this.spu.spuImageList = this.spuImageList.map((item) => {
        return {
          imgName: item.name,
          imgUrl: (item.response && item.response.data) || item.url, 
        };
      });
       console.log(this.spu.spuImageList)
      // 发请求
      let result = await this.$API.spu.reqAddOrUpdateSpu(this.spu);
      if (result.code == 200) {
        this.$message({ type: "success", message: "保存成功" });
        // 通知父组件回调场景0
        this.$emit("changeScene", {
          scene: 0,
          flag: this.spu.id ? "修改" : "添加",
        });
      }
      // 清除数据
      Object.assign(this._data, this.$options.data());
    },
    // 点击添加spu按钮，发请求的回调
    async addSpuData(category3Id) {
      // 收集三级分类id
      this.spu.category3Id = category3Id;
      // 获取品牌信息
      let radeMarkResult = await this.$API.spu.reqTradeMarkList();
      if (radeMarkResult.code == 200) {
        this.tradeMarkList = radeMarkResult.data;
      }
      // 获取平台销售属性信息
      let saleResult = await this.$API.spu.reqBaseSaleAttrList();
      if (saleResult.code == 200) {
        this.saleAttrList = saleResult.data;
      }
    },
    // 取消按钮，通知父亲切换场景为0
    cancle() {
      this.$emit("changeScene", { scene: 0, flag: "" });
      // 清空数据
      //  Object.assign:es6新语法，可以合并对象
      // 组件实例this._data，可以操作data中的响应式数据
      // this.$options可以获取配置对象，配置对象的data函数执行，返回响应式数据为空
      Object.assign(this._data, this.$options.data());
    },
  },
  computed: {
    // 还未选中的销售属性
    unSelectSaleAttr() {
      // 从已有的数组中过滤出用户需要的元素，并返回新的数组
      let result = this.saleAttrList.filter((item) => {
        // every是数组的方法，会返回一个bool值
        return this.spu.spuSaleAttrList.every((item1) => {
          return item.name != item1.saleAttrName;
        });
      });
      return result;
    },
  },
};
</script>

<style>
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>