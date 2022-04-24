import React from 'react';
import { FormProps, GetFieldDecoratorOptions } from 'antd/lib/form/Form';

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
   * 1或2维数组，存储组件配置信息/自定义渲染组件
   */
  layoutData: Item[] | Item[][];

  /**
   * 定义一行渲染几个组件，layoutData为一维数组时生效, 可以是: 1 | 2 | 3 | 4, 默认1,
   */
  cols?: number;

  formData: FormProps;
};

export type SpaceLayoutProps = {
  /**
   * 1维数组，存储组件配置信息/自定义渲染组件
   */
  layoutData: Item[];
  form: any;
};

export type LayoutType = 'row' | 'space';
