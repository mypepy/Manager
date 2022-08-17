<template>
  <div>
    <el-card style="margin: 20px 0px"
      ><CategorySelect @getCategoryId="getCategoryId" :show="!isShowTable"></CategorySelect
    ></el-card>
    <el-card>
      <div v-show="isShowTable">
        <el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="!category3Id"
          @click="addAttr"
          >添加属性</el-button
        >
        <!-- 表格：展示平台属性 -->
        <el-table style="width: 100%" border :data="attrList">
          <el-table-column
            width="80"
            label="序号"
            type="index"
            align="center"
          ></el-table-column>
          <el-table-column
            width="150"
            label="属性名称"
            prop="attrName"
          ></el-table-column>
          <el-table-column width="width" label="属性值列表">
            <template slot-scope="{ row, $index }">
              <el-tag
                style="margin: 2px 10px"
                type="success"
                v-for="(attrValue, index) in row.attrValueList"
                :key="attrValue.id"
                >{{ attrValue.valueName }}</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column width="150" label="操作">
            <template slot-scope="{ row, $index }">
              <el-button
                type="warning"
                icon="el-icon-edit"
                size="mini"
                @click="updateAttr(row)"
              ></el-button>
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 添加|修改属性 -->
      <div v-show="!isShowTable">
        <el-form :inline="true" label-width="80px" :model="attrInfo">
          <el-form-item label="属性名">
            <el-input
              placeholder="请输入属性名"
              v-model="attrInfo.attrName"
            ></el-input>
          </el-form-item>
          <el-button
            type="primary"
            icon="el-icon-plus"
            @click="addAttrValue"
            :disabled="!attrInfo.attrName"
            >添加属性值</el-button
          >
          <el-button @click="isShowTable = true">取消</el-button>
          <el-table
            style="width: 100%; margin: 20px 0px"
            borde
            :data="attrInfo.attrValueList"
          >
            <el-table-column
              align="center"
              type="index"
              label="序号"
              width="80"
            >
            </el-table-column>
            <el-table-column align="center" label="属性值名称" width="width">
              <template slot-scope="{ row, $index }">
                <!-- 此处需要input和span切换 -->
                <el-input
                  size="mini"
                  v-model="row.valueName"
                  placeholder="请输入属性值名称"
                  v-if="row.flag"
                  @blur="toLook(row)"
                  @keyup.native.enter="toLook(row)"
                  :ref="$index"
                ></el-input>
                <span
                  v-else
                  @click="toEdit(row, $index)"
                  style="display: block"
                  >{{ row.valueName }}</span
                >
              </template>
            </el-table-column>
            <el-table-column align="center" label="操作" width="width">
              <template slot-scope="{ row, $index }">
                <!-- 气泡确认框 -->
                <el-popconfirm
                  :title="`确定删除${row.valueName}吗?`"
                  @onConfirm="deleteAttrValue($index)"
                >
                  <el-button
                    type="danger"
                    icon="el-icon-delete"
                    size="mini"
                    slot="reference"
                  ></el-button>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
          <el-button type="primary" @click="addOrUpdateAttr" :disabled="attrInfo.attrValueList.length<1">保存</el-button>
          <el-button @click="isShowTable = true">取消</el-button>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script>
// 按需引入lodash中的深拷贝
import cloneDeep from "lodash/cloneDeep";
export default {
  name: "Attr",
  data() {
    return {
      category1Id: "",
      category2Id: "",
      category3Id: "",
      // 接受平台属性数据
      attrList: [],
      // 控制表格显示与隐藏
      isShowTable: true,
      // 收集新增|修改属性使用的
      attrInfo: {
        attrName: "", //属性名
        attrValueList: [
          //属性值，有多个
        ],
        categoryId: 0, //三级分类id
        categoryLevel: 3, //服务器也需要区分几集id
      },
    };
  },
  methods: {
    // 自定义事件回调
    getCategoryId({ categoryId, level }) {
      // 区分三级分类相应id，以及父组件进行存储
      if (level == 1) {
        this.category1Id = categoryId;
        this.category2Id = "";
        this.category3Id = "";
      } else if (level == 2) {
        this.category2Id = categoryId;
        this.category3Id = "";
      } else {
        // 代表三级分类id都有了
        this.category3Id = categoryId;
        this.getAttrList();
      }
    },
    // 获取平台属性的数据
    async getAttrList() {
      const { category1Id, category2Id, category3Id } = this;
      let result = await this.$API.attr.reqAttrList(
        category1Id,
        category2Id,
        category3Id
      );
      if (result.code == 200) {
        this.attrList = result.data;
      }
    },
    // 添加属性值回调
    addAttrValue() {
      // 向属性值数组添加元素
      this.attrInfo.attrValueList.push({
        attrId: this.attrInfo.id, //对于修改某一个属性的时候，可以在已有的属性值之上新增新的属性值，但是需要把已有的的属性的id带上
        valueName: "",
        flag: true,
      });
      this.$nextTick(() => {
        this.$refs[this.attrInfo.attrValueList.length - 1].focus();
      });
    },
    // 添加属性回调
    addAttr() {
      // 切换table显示与隐藏
      this.isShowTable = false;
      this.attrInfo = {
        attrName: "", //属性名
        attrValueList: [
          //属性值，有多个
        ],
        categoryId: this.category3Id, //三级分类id
        categoryLevel: 3,
      };
    },
    // 修改某个属性
    updateAttr(row) {
      this.isShowTable = false;
      //  将选中的属性赋给attrInfo
      // 由于数据结构中存在对象里面套数组，数组里面又套对象，所有要使用深拷贝
      this.attrInfo = cloneDeep(row);
      // 在修改某个属性时，将相应的属性值元素添上flag标记
      this.attrInfo.attrValueList.forEach((item) => {
        // 第一个参数：对象 第二个参数：添加新的响应式属性 第三个参数：新属性的属性值
        this.$set(item, `flag`, false);
      });
    },
    // 失去焦点--切换为查看模式，展示span
    toLook(row) {
      // 如果属性值为空，要给用户提示
      if (row.valueName.trim() == "") {
        this.$message("请输入正常的属性值");
        return;
      }
      // 新增的属性值不能与已有的属性值重复
      let isRepeat = this.attrInfo.attrValueList.some((item) => {
        // 需要将row从数组里面判断的时候去除重复的
        // row:形参是当前用户添加的最新属性值，数组最后一个元素
        if (row != item) {
          return row.valueName == item.valueName;
        }
      });
      if (isRepeat) return;
      // 当前的编辑模式变为查看模式
      row.flag = false;
    },
    // 点击span的回调，变回编辑模式
    toEdit(row, index) {
      row.flag = true;
      // 获取input节点，实现自动聚焦
      // 点击span的时候，切换为input编辑模式，但是页面重绘和重排是要时间的，因此不能一点击就立马获取input
      this.$nextTick(() => {
        this.$refs[index].focus();
      });
    },
    // 气泡确认框回调
    deleteAttrValue(index) {
      // 当前删除属性值不需要发请求
      this.attrInfo.attrValueList.splice(index, 1);
    },
    // 保存按钮，进行添加或修改属性的操作
    async addOrUpdateAttr() {
      // 整理参数：1 用户添加的空属性值不应该提交给服务器 2 flag不要提交给flag
      this.attrInfo.attrValueList = this.attrInfo.attrValueList.filter(
        (item) => {
          // 过滤掉属性值不为空的
          if (item.valueName != "") {
            // 删除掉flag属性
            delete item.flag;
            return true;
          }
        }
      );
      try {
        // 发请求
        await this.$API.attr.reqAddOrUpdateAttr(this.attrInfo);
        // 展示平台属性的信号量进行切换
        this.isShowTable=true;
        this.$message({ type: "success", message: "保存成功" });
        this.getAttrList();
      } catch (error) {
        this.$message("保存失败");
      }
    },
  },
};
</script>

<style>
</style>