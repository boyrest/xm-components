import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Filter, { FilterRef, IFilterProps } from './Filter';
import { Table } from 'antd';
import { SorterResult, TableProps } from 'antd/lib/table/interface';
import _ from 'lodash';
import { PaginationConfig } from 'antd/lib/pagination/Pagination';
import './index.less';
import { WrappedFormUtils } from 'antd/lib/form/Form';

export type RequestResult<T> = {
  total: number;
  data: T[];
};

export type RequestPagination = {
  current: number;
  pageSize: number;
};

export type IProTable<T> = {
  filterProps: Omit<IFilterProps, 'loading'>;
  tableProps: TableProps<T> & { paginationDisplayCount: number | undefined };
  request: (
    searchFilters: Record<string, unknown> | null,
    pagination: RequestPagination,
    tableFilter: Partial<Record<keyof T, string[]>>,
  ) => Promise<RequestResult<T>>;
  onError: (e: unknown) => void;
};

export type ProTableRef = {
  delRefresh: () => void;
  addRefresh: () => void;
  refresh: () => void;
  searchWithFilters: (value: Record<string, unknown> | null) => void;
  getFilterHandle: () => WrappedFormUtils | null;
};

const ProTable = function <T>() {
  return forwardRef<ProTableRef, IProTable<T>>((props, ref) => {
    const { filterProps, tableProps, onError, request, children } = props;
    const paginationSetting = tableProps.pagination || {};
    const paginationDisplayCount = tableProps.paginationDisplayCount || 10;
    const [loading, setLoading] = useState(false);
    const [current, setCurrent] = useState(paginationSetting.current || 1);
    const [total, setTotal] = useState(0);
    const [pageSize, setPageSize] = useState(paginationSetting.pageSize || 10);
    const [tableFilters, setTableFilters] = useState<Partial<Record<keyof T, string[]>>>({});
    const [sorter, setSorter] = useState<SorterResult<T> | {}>({});
    const [filters, setFilters] = useState<Record<string, unknown> | null>(null);
    const [list, setList] = useState<T[]>([]);

    const timeRef = useRef<number | null>(null);
    const filterRef = useRef<FilterRef>(null);

    async function getData() {
      setLoading(true);
      try {
        const result = await request(filters, { current, pageSize }, tableFilters);
        setTotal(result.total);
        setList(result.data);
      } catch (e: unknown) {
        onError(e);
      } finally {
        setLoading(false);
      }
    }

    useImperativeHandle<ProTableRef, ProTableRef>(ref, () => ({
      delRefresh: () => {
        if (current === 1) {
          getData();
        } else {
          const preCount = (current - 1) * pageSize;
          if (preCount + 1 === total) {
            setCurrent(current - 1);
          } else {
            getData();
          }
        }
      },
      refresh: () => {
        getData();
      },
      addRefresh: () => {
        if (current !== 1) {
          setCurrent(1);
        } else {
          getData();
        }
      },
      searchWithFilters: (value: Record<string, unknown> | null) => {
        setFilters(value || {});
        setCurrent(1);
      },
      getFilterHandle: () => {
        return filterRef.current?.getFilterHandle() || null;
      },
    }));

    useEffect(() => {
      if (timeRef.current) {
        clearTimeout(timeRef.current);
        timeRef.current = null;
      }
      timeRef.current = setTimeout(getData, 400);
    }, [current, pageSize, tableFilters, filters, sorter]);

    function onChange(
      pagination: PaginationConfig,
      newFilters: Partial<Record<keyof T, string[]>>,
      newSorter: SorterResult<T>,
    ) {
      if (total > paginationDisplayCount) {
        pagination.current && setCurrent(pagination.current);
        pagination.pageSize && setPageSize(pagination.pageSize);
      }
      if (!_.isEqual(newFilters, tableFilters) || !_.isEqual(newSorter, sorter)) {
        setCurrent(1);
      }
      if (!_.isEqual(newFilters, tableFilters)) {
        setTableFilters(tableFilters);
      }
      if (!_.isEqual(newSorter, sorter)) {
        setSorter(newSorter);
      }
    }

    function onSearch(newFilters: Record<string, unknown>) {
      setFilters(newFilters);
      setCurrent(1);
    }

    function onReset(value: Record<string, unknown> | null) {
      setFilters(value);
      setCurrent(1);
    }

    const paginationConfig: PaginationConfig | false =
      total > paginationDisplayCount
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
        {filterProps && filterProps.layoutData && filterProps.layoutData.length > 0 ? (
          <Filter
            {...filterProps}
            loading={loading}
            onSearch={onSearch}
            onReset={onReset}
            wrappedComponentRef={filterRef}
          />
        ) : null}
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
