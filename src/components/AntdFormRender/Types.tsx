import React from 'react';
import { FormProps, GetFieldDecoratorOptions, WrappedFormUtils } from 'antd/lib/form/Form';

export type Item = {
  /** 组件类型，比如Input,Button,"input"  */
  type?: React.ComponentType | string;

  /** Form.Item name, 字段名 */
  name?: string;

  /** Form.Item label, 标签的文本*/
  label?: React.ReactNode;

  /** 自定义渲染 */
  render?: () => React.ReactNode;

  /** 动态返回Item，优先级高于render */
  getJSON?: () => Item | null;

  /** 组件props,会透传给type定义的组件 */
  elProps?: Record<string, unknown>;

  /** Form.Item的props,会透传给Form.Item */
  itemProps?: Record<string, unknown>;

  /** getFieldDecorator 设置options*/
  decoratorOptions?: GetFieldDecoratorOptions;

  /** 判断是否渲染 */
  visible?: () => boolean;
};

export type FormRenderProps = {
  /**
   * @description 1或2维数组，存储组件配置信息/自定义渲染组件。
   * 一维数组：从上往下一行放一个组件 ,设置了cols则一行显示cols(1/2/3/4)个组件
   * 二维数组:子数组配置的所有组件渲染为一行（不定列布局）,数组（或子数组）内组件会等分一行所占空间，内部采用Row,Col布局
   */
  layoutData: Item[] | Item[][];

  /**
   * @description 定义一行渲染几个组件，layoutData为一维数组时生效, 可以是: 1 | 2 | 3 | 4, 默认1,
   */
  cols?: number;

  /**
   * @description 定义antd <Form/>属性
   */
  formData?: FormProps;

  /**
   * @description normal为流排布，autoLayout 为块排布配合cols使用
   * */
  layoutType?: LayoutType;

  /**
   * @description antd Form.create 实例
   */
  form: WrappedFormUtils<unknown>;
};

export type SpaceLayoutProps = {
  /**
   * 1维数组，存储组件配置信息/自定义渲染组件
   */
  layoutData: Item[];
  form: any;
};

export type LayoutType = 'normal' | 'row' | 'default';
