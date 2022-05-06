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
  filterProps?: Omit<IFilterProps, 'loading'>;
  tableProps: TableProps<T> & { paginationDisplayCount: number | undefined };
  request: (
    searchFilters: Record<string, unknown> | null,
    sorter: SorterResult<T> | {},
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
    const tableFiltersRef = useRef<Partial<Record<keyof T, string[]>>>({});
    const sorterRef = useRef<SorterResult<T> | {}>({});
    const filtersRef = useRef<Record<string, unknown> | null>(null);
    const [list, setList] = useState<T[]>([]);
    const filterRef = useRef<FilterRef | null>(null);

    async function getData(current, pageSize) {
      setLoading(true);
      try {
        const result = await request(
          filtersRef.current,
          sorterRef.current,
          { current, pageSize },
          tableFiltersRef.current,
        );
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
          getData(current, pageSize);
        } else {
          const preCount = (current - 1) * pageSize;
          if (preCount + 1 === total) {
            getData(current - 1, pageSize);
            setCurrent(current - 1);
          } else {
            getData(current, pageSize);
          }
        }
      },
      refresh: () => {
        getData(current, pageSize);
      },
      addRefresh: () => {
        if (current !== 1) {
          getData(1, pageSize);
          setCurrent(1);
        } else {
          getData(current, pageSize);
        }
      },
      searchWithFilters: (value: Record<string, unknown> | null) => {
        filtersRef.current = value || {};
        setCurrent(1);
        getData(1, pageSize);
      },
      getFilterHandle: () => {
        return filterRef.current?.getFilterHandle() || null;
      },
    }));

    useEffect(() => {
      getData(current, pageSize);
    }, []);

    function onChange(
      pagination: PaginationConfig,
      newFilters: Partial<Record<keyof T, string[]>>,
      newSorter: SorterResult<T>,
    ) {
      if (total > paginationDisplayCount) {
        pagination.current && setCurrent(pagination.current);
        pagination.pageSize && setPageSize(pagination.pageSize);
      }
      const isFilterChange =
        !_.isEqual(newFilters, tableFiltersRef.current) || !_.isEqual(newSorter, sorterRef.current);
      if (isFilterChange) {
        setCurrent(1);
      }
      if (!_.isEqual(newFilters, tableFiltersRef.current)) {
        tableFiltersRef.current = newFilters;
      }
      if (!_.isEqual(newSorter, sorterRef.current)) {
        sorterRef.current = newSorter;
      }
      const currentValue = isFilterChange ? 1 : pagination?.current || current;
      const currentPageSize = pagination?.pageSize || pageSize;
      getData(currentValue, currentPageSize);
    }

    function onSearch(newFilters: Record<string, unknown>) {
      filtersRef.current = newFilters;
      setCurrent(1);
      getData(1, pageSize);
    }

    function onReset(value: Record<string, unknown> | null) {
      filtersRef.current = value;
      setCurrent(1);
      getData(1, pageSize);
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
