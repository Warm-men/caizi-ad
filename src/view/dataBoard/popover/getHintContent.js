const getHintContent = (type) => {
  let value = null
  switch (type) {
    case 'keyIndicators' :
      value = {
        title: '展示您所在机构的员工及客户数据。',
        descArr: [
          {
            title: '客户总人数',
            text: '统计周期内，员工已添加的客户总人数。'
          },
          {
            title: '活跃客户占比',
            text: '统计周期内，浏览过员工分享内容的客户人数（含潜在客户和游客）占客户总人数的百分比（可能超过100%）。'
          },
          {
            title: '发送产品员工人数',
            text: '统计周期内，发送过产品的员工人数。'
          }, {
            title: '产品点击购买率',
            text: '统计周期内，在产品详情页中点击“前往办理”按钮的客户人数（含潜在客户和游客）占浏览产品详情页（有配置行内链接）的客户总人数（含潜在客户和游客）的百分比。'
          }
        ]
      }
      break
    case 'hotProduct' :
      value = {
        title: '展示您所在机构的员工所分享产品的效果数据。',
        descArr: [
          {
            title: '浏览客户人数',
            text: '所选时间范围内，浏览过该产品的客户人数（含潜在客户和游客）。'
          },
          {
            title: '人均浏览次数',
            text: '所选时间范围内，客户浏览该产品的总次数（含潜在客户和游客）/浏览客户人数（含潜在客户和游客）。'
          },
          {
            title: '点击购买人数',
            text: '所选时间范围内，在该产品详情页中点击“前往办理”按钮的客户人数（含潜在客户和游客）。'
          }
        ]
      }
      break
    case 'hotContent' :
      value = {
        title: '展示您所在机构的员工所分享内容的效果数据。',
        descArr: [
          {
            title: '浏览客户人数',
            text: '所选时间范围内，浏览过该内容的客户人数（含潜在客户和游客）。'
          },
          {
            title: '人均浏览次数',
            text: '所选时间范围内，客户浏览该内容的总次数（含潜在客户和游客）/浏览客户人数（含潜在客户和游客）。'
          }
        ]
      }
      break
  }
  return value
}

export default getHintContent
