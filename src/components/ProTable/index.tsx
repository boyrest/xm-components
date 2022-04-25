import React, { useState, useEffect } from 'react';
import Filter, { IFilterProps } from './Filter';
import debounce from 'lodash/debounce';
import { Table } from 'antd';
import { TableProps } from 'antd/lib/table/interface';
import './index.less';

export type IProTable<T> = {
  filterProps: IFilterProps;
  tableProps: TableProps<T>;
  request: (searchFilters: any, pagination: any, tableFilter: any) => any;
};

const ProTable = <DataType extends Record<string, any>>(props: IProTable<DataType>) => {
  const { filterProps, tableProps } = props;
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [list, setList] = useState([
    {
      key: '1',
      name: '胡彦斌',
      age: 32,
      address: '西湖区湖底公园1号',
    },
    {
      key: '2',
      name: '胡彦祖',
      age: 42,
      address: '西湖区湖底公园1号',
    },
  ]);

  useEffect(() => {
    debounce(() => {
      // formatParamsAndFetch(current);
    }, 250)();
  }, [current, pageSize]);

  return (
    <div>
      <Filter {...filterProps} loading={loading} />
      <Table {...tableProps} dataSource={list} />
    </div>
  );
};

export default ProTable;
