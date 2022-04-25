---
group:
  title: 数据展示
  order: 1
title: ProTable 增删改查列表
---

<h2>ProTable 增删改查列表</h2>

<p>
 基于antd3，AntdFormRender,创建的增删改查列表
</p>

<h3>代码演示</h3>

<h3>常用查询分页数据</h3>

```tsx
import React, { useRef } from 'react';
import { ProTable } from 'xm-components-v3';
import { Form, Button, Input } from 'antd';

export default (props) => {
  const filterData = [
    {
      type: Input,
      name: 'name',
      label: '姓名',
      elProps: {
        maxLength: 11,
        placeholder: '请输入姓名',
      },
      itemProps: {
        labelCol: { span: 4 },
        wrapperCol: { span: 20 },
      },
    },
    {
      type: Input,
      name: 'age',
      label: '年龄',
      elProps: {
        maxLength: 3,
        placeholder: '请输入姓名',
      },
      itemProps: {
        labelCol: { span: 4 },
        wrapperCol: { span: 20 },
      },
    },
  ];
  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: '住址',
      dataIndex: 'address',
      key: 'address',
    },
  ];

  return <ProTable filterProps={{ layoutData: filterData, cols: 3 }} tableProps={{ columns }} />;
};
```
