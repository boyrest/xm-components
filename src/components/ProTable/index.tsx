import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Filter, { IFilterProps } from './Filter';
import { Table } from 'antd';
import { TableProps } from 'antd/lib/table/interface';
import _ from 'lodash';
import './index.less';
import { PaginationConfig } from 'antd/lib/pagination/Pagination';

export type IProTable<T> = {
  filterProps: Omit<IFilterProps, 'loading'>;
  tableProps: TableProps<T>;
  request: (searchFilters: any, pagination: any, tableFilter: any) => any;
  onError: (e: any) => void;
};

export type ProTableRef = {
  delHandle: () => void;
  addHandle: () => void;
};

const ProTable = function <T>() {
  return forwardRef<ProTableRef, IProTable<T>>((props, ref) => {
    const { filterProps, tableProps, onError, request, children } = props;
    const paginationSetting = tableProps?.pagination || {};
    const [loading, setLoading] = useState(false);
    const [current, setCurrent] = useState(paginationSetting.current || 1);
    const [total, setTotal] = useState(0);
    const [pageSize, setPageSize] = useState(paginationSetting.pageSize || 10);
    const [tableFilters, setTableFilters] = useState({});
    const [filters, setFilters] = useState(null);
    const [list, setList] = useState([]);
    const timeRef = useRef<number | null>(null);

    useImperativeHandle<ProTableRef, ProTableRef>(ref, () => ({
      delHandle: () => {},
      addHandle: () => {},
    }));

    useEffect(() => {
      if (timeRef.current) {
        clearTimeout(timeRef.current);
        timeRef.current = null;
      }
      timeRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          const result = await request(filters, { current, pageSize }, tableFilters);
          setTotal(result.total);
          setList(result.data);
        } catch (e) {
          onError(e);
        } finally {
          setLoading(false);
        }
      }, 400);
    }, [current, pageSize, tableFilters, filters]);

    function onChange(pagination: any, newFilters: any) {
      if (total > pageSize) {
        setCurrent(pagination.current);
        setPageSize(pagination.pageSize);
      }
      if (!_.isEqual(newFilters, tableFilters)) {
        setCurrent(1);
        setTableFilters(tableFilters);
      }
    }

    function onSearch(newFilters: any) {
      setFilters(newFilters);
    }

    function onReset(value: any) {
      setFilters(value);
      setCurrent(1);
    }

    const paginationConfig: PaginationConfig | false =
      total > pageSize
        ? {
            ...(tableProps?.pagination || null),
            showQuickJumper: true,
            showSizeChanger: true,
            current,
            total,
            pageSize,
          }
        : false;

    return (
      <div>
        <Filter {...filterProps} loading={loading} onSearch={onSearch} onReset={onReset} />
        {children}
        <Table<T>
          {...tableProps}
          pagination={paginationConfig}
          onChange={onChange}
          dataSource={list}
          loading={loading}
        />
      </div>
    );
  });
};

export default ProTable;
