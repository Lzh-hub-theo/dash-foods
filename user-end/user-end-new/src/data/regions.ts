/**
 * dash-foods · 简化地区数据（省/市两级）
 *
 * 真实项目应通过 `/admin/region/child?pid=xxx` 级联拉取，
 * 这里为离线 demo / 后端无 region 接口的兜底，整理常用省 + 直辖市。
 */

export interface RegionNode {
  code: string
  name: string
  /** 直辖市 / 省份时挂载城市；城市时挂载常用区县 */
  children?: RegionNode[]
}

/** 省份 + 直辖市（按拼音排序） */
export const REGIONS: RegionNode[] = [
  {
    code: '110000',
    name: '北京市',
    children: [
      { code: '110100', name: '北京市', children: [
        { code: '110101', name: '东城区' },
        { code: '110102', name: '西城区' },
        { code: '110105', name: '朝阳区' },
        { code: '110106', name: '丰台区' },
        { code: '110107', name: '石景山区' },
        { code: '110108', name: '海淀区' },
        { code: '110109', name: '门头沟区' },
      ] },
    ],
  },
  {
    code: '310000',
    name: '上海市',
    children: [
      { code: '310100', name: '上海市', children: [
        { code: '310101', name: '黄浦区' },
        { code: '310104', name: '徐汇区' },
        { code: '310105', name: '长宁区' },
        { code: '310106', name: '静安区' },
        { code: '310107', name: '普陀区' },
        { code: '310109', name: '虹口区' },
        { code: '310110', name: '杨浦区' },
        { code: '310112', name: '闵行区' },
        { code: '310113', name: '宝山区' },
      ] },
    ],
  },
  {
    code: '440000',
    name: '广东省',
    children: [
      { code: '440100', name: '广州市', children: [
        { code: '440103', name: '荔湾区' },
        { code: '440104', name: '越秀区' },
        { code: '440105', name: '海珠区' },
        { code: '440106', name: '天河区' },
        { code: '440111', name: '白云区' },
      ] },
      { code: '440300', name: '深圳市', children: [
        { code: '440303', name: '罗湖区' },
        { code: '440304', name: '福田区' },
        { code: '440305', name: '南山区' },
        { code: '440306', name: '宝安区' },
        { code: '440307', name: '龙岗区' },
      ] },
      { code: '440600', name: '佛山市', children: [
        { code: '440604', name: '禅城区' },
        { code: '440605', name: '南海区' },
        { code: '440606', name: '顺德区' },
      ] },
    ],
  },
  {
    code: '330000',
    name: '浙江省',
    children: [
      { code: '330100', name: '杭州市', children: [
        { code: '330102', name: '上城区' },
        { code: '330105', name: '拱墅区' },
        { code: '330106', name: '西湖区' },
        { code: '330108', name: '滨江区' },
        { code: '330110', name: '余杭区' },
      ] },
      { code: '330200', name: '宁波市', children: [
        { code: '330203', name: '海曙区' },
        { code: '330205', name: '江北区' },
        { code: '330212', name: '鄞州区' },
      ] },
    ],
  },
  {
    code: '320000',
    name: '江苏省',
    children: [
      { code: '320100', name: '南京市', children: [
        { code: '320102', name: '玄武区' },
        { code: '320104', name: '秦淮区' },
        { code: '320105', name: '建邺区' },
        { code: '320106', name: '鼓楼区' },
      ] },
      { code: '320500', name: '苏州市', children: [
        { code: '320505', name: '虎丘区' },
        { code: '320506', name: '吴中区' },
        { code: '320507', name: '相城区' },
        { code: '320508', name: '姑苏区' },
        { code: '320509', name: '吴江区' },
      ] },
    ],
  },
  {
    code: '510000',
    name: '四川省',
    children: [
      { code: '510100', name: '成都市', children: [
        { code: '510104', name: '锦江区' },
        { code: '510105', name: '青羊区' },
        { code: '510106', name: '金牛区' },
        { code: '510107', name: '武侯区' },
        { code: '510108', name: '成华区' },
      ] },
    ],
  },
  {
    code: '420000',
    name: '湖北省',
    children: [
      { code: '420100', name: '武汉市', children: [
        { code: '420102', name: '江岸区' },
        { code: '420103', name: '江汉区' },
        { code: '420104', name: '硚口区' },
        { code: '420105', name: '汉阳区' },
        { code: '420106', name: '武昌区' },
      ] },
    ],
  },
  {
    code: '610000',
    name: '陕西省',
    children: [
      { code: '610100', name: '西安市', children: [
        { code: '610102', name: '新城区' },
        { code: '610103', name: '碑林区' },
        { code: '610104', name: '莲湖区' },
        { code: '610111', name: '灞桥区' },
      ] },
    ],
  },
  {
    code: '370000',
    name: '山东省',
    children: [
      { code: '370100', name: '济南市', children: [
        { code: '370102', name: '历下区' },
        { code: '370103', name: '市中区' },
        { code: '370104', name: '槐荫区' },
      ] },
      { code: '370200', name: '青岛市', children: [
        { code: '370202', name: '市南区' },
        { code: '370203', name: '市北区' },
        { code: '370211', name: '黄岛区' },
      ] },
    ],
  },
]

export function findProvince(code: string) {
  return REGIONS.find((p) => p.code === code)
}

export function findCity(provinceCode: string, cityCode: string) {
  return findProvince(provinceCode)?.children?.find((c) => c.code === cityCode)
}

export function findDistrict(provinceCode: string, cityCode: string, districtCode: string) {
  return findCity(provinceCode, cityCode)?.children?.find((d) => d.code === districtCode)
}