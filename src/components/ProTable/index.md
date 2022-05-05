---
group:
  title: 数据展示
  order: 1
title: ProTable 增删改查列表
---

<h2>ProTable 增删改查列表</h2>

<p>
 基于antd3，AntdFormRender的CURD列表
</p>

<h3>代码演示</h3>

<h3>常用查询分页数据</h3>

```tsx
import React, { useEffect, useRef } from 'react';
import { ProTable } from 'xm-components-v3';
import { Form, Button, Input, Row, Popconfirm, message } from 'antd';
import queryString from 'query-string';

interface DataItem {
  body: string;
  id: number;
  title: string;
  userId: number;
}

export default (props) => {
  const tableRef = useRef(null);
  useEffect(() => {}, []);
  const filterData = [
    {
      type: Input,
      name: 'id',
      label: '文章ID',
      elProps: {
        maxLength: 11,
        placeholder: '请输入文章ID',
        autoComplete: 'off',
      },
      itemProps: {
        labelCol: { span: 4 },
        wrapperCol: { span: 20 },
      },
    },
    {
      type: Input,
      name: 'userId',
      label: 'userID',
      elProps: {
        maxLength: 3,
        placeholder: '请输入userID',
        autoComplete: 'off',
      },
      itemProps: {
        labelCol: { span: 4 },
        wrapperCol: { span: 20 },
      },
    },
  ];
  const columns = [
    {
      title: '文章ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: 'userID',
      dataIndex: 'userId',
      key: 'userId',
      width: 100,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '内容',
      dataIndex: 'body',
      key: 'body',
      ellipsis: true,
    },
    {
      title: '操作',
      dataIndex: 'actions',
      width: 100,
      fixed: 'right',
      render: (value, record) => {
        return (
          <Row>
            <Popconfirm
              icon={null}
              placement="topRight"
              title="确认删除该记录吗？"
              onConfirm={() => handleDel(record.id)}
              okText="删除"
              cancelText="取消"
            >
              <span style={{ color: '#1890ff', cursor: 'pointer' }}>删除</span>
            </Popconfirm>
          </Row>
        );
      },
    },
  ];

  function handleDel() {
    message.success('删除成功');
    tableRef.current.delRefresh();
  }

  const ProTableComponent = ProTable<DataItem>();

  return (
    <ProTableComponent
      filterProps={{ layoutData: filterData, cols: 3 }}
      tableProps={{ columns }}
      request={async (searchFilters, sorter, pagination, tableFilter) => {
        console.log(searchFilters, pagination, tableFilter, '=======');
        const params = { ...searchFilters, _limit: pagination.pageSize, _page: pagination.current };
        const paramString = queryString.stringify(params);
        const response = await fetch(`https://jsonplaceholder.typicode.com/posts?${paramString}`, {
          method: 'GET',
          mode: 'cors',
        });
        const data = await response.json();
        console.log(data, '=====data======');
        return {
          total: 100,
          data,
        };
      }}
      onError={(e) => {
        console.log(e);
      }}
      ref={tableRef}
    >
      <div>
        <Button
          type="primary"
          style={{ marginBottom: '20px' }}
          onClick={() => {
            message.success('创建成功');
            tableRef.current.addRefresh();
          }}
        >
          创建新的文章
        </Button>
      </div>
    </ProTableComponent>
  );
};
```
