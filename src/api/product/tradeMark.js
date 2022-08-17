import request from '@/utils/request'

// 获取品牌列表接口
export const reqTradeMarkList = (page, limit) => request({ url: `admin/product/baseTrademark/${page}/${limit}`, method: 'get' });

// 处理添加品牌的操作
// 新增品牌： /admin/product/baseTrademark/save post 品牌名称，品牌logo，id由服务器生成
// 修改品牌：/admin/product/baseTrademark/update put 品牌名称，品牌logo，id

export const reqAddOrUpdateTradeMark = (tradeMark) => {
    // 有id，代表修改
    if (tradeMark.id) {
        return request({ url: '/admin/product/baseTrademark/update', method: 'put', data: tradeMark })
    } else {
        // 新增
        return request({ url: '/admin/product/baseTrademark/save', method: 'post', data: tradeMark })
    }
}

// 删除品牌： /admin/product/baseTrademark/remove/{id} delete
export const reqDeleteTradeMark=(id)=>request({url:`/admin/product/baseTrademark/remove/${id}`,method:'delete'})
