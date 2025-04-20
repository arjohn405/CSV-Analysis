'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronUpIcon, ChevronDownIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import styles from './DynamicTable.module.css';

export type ColumnDefinition<T> = {
  id: string;
  header: string;
  accessor: (row: T) => React.ReactNode;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  sortable?: boolean;
  priority?: number;
};

export type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

type DynamicTableProps<T> = {
  data: T[];
  columns: ColumnDefinition<T>[];
  onRowClick?: (row: T) => void;
  highlightRow?: (row: T) => boolean;
  isLoading?: boolean;
  emptyMessage?: string | React.ReactNode;
  className?: string;
  initialSortConfig?: SortConfig;
  responsiveBreakpoint?: number;
};

export default function DynamicTable<T extends { [key: string]: any }>({
  data,
  columns,
  onRowClick,
  highlightRow,
  isLoading = false,
  emptyMessage = 'No data available',
  className = '',
  initialSortConfig = null,
  responsiveBreakpoint = 768,
}: DynamicTableProps<T>) {
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [resizeStartX, setResizeStartX] = useState<number>(0);
  const [sortConfig, setSortConfig] = useState<SortConfig>(initialSortConfig);
  const [tableWidth, setTableWidth] = useState<number>(0);
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false);
  const tableRef = useRef<HTMLTableElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < responsiveBreakpoint);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [responsiveBreakpoint]);

  const visibleColumns = useCallback(() => {
    if (!isSmallScreen) return columns;
    
    return columns
      .map(col => ({ ...col, priority: col.priority || 0 }))
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3);
  }, [columns, isSmallScreen]);

  useEffect(() => {
    if (tableRef.current && containerRef.current) {
      const containerWidth = containerRef.current.getBoundingClientRect().width;
      setTableWidth(containerWidth);
      
      const widths: Record<string, number> = {};
      const visibleCols = visibleColumns();
      
      const fixedWidthColumns = visibleCols.filter(col => col.width);
      const fixedWidthSum = fixedWidthColumns.reduce((sum, col) => sum + (col.width || 0), 0);
      
      const flexColumns = visibleCols.filter(col => !col.width);
      const availableForFlex = Math.max(0, containerWidth - fixedWidthSum);
      const flexColumnWidth = flexColumns.length > 0 ? availableForFlex / flexColumns.length : 0;
      
      visibleCols.forEach(column => {
        if (column.width) {
          widths[column.id] = column.width;
        } else {
          widths[column.id] = flexColumnWidth;
        }
      });
      
      setColumnWidths(widths);
    }
  }, [visibleColumns]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && tableRef.current) {
        const newWidth = containerRef.current.getBoundingClientRect().width;
        
        if (Math.abs(newWidth - tableWidth) > 5) {
          setTableWidth(newWidth);
          
          const widths: Record<string, number> = {};
          const visibleCols = visibleColumns();
          
          const fixedWidthColumns = visibleCols.filter(col => col.width);
          const fixedWidthSum = fixedWidthColumns.reduce((sum, col) => sum + (col.width || 0), 0);
          
          const flexColumns = visibleCols.filter(col => !col.width);
          const availableForFlex = Math.max(0, newWidth - fixedWidthSum);
          const flexColumnWidth = flexColumns.length > 0 ? availableForFlex / flexColumns.length : 0;
          
          visibleCols.forEach(column => {
            if (column.width) {
              widths[column.id] = column.width;
            } else {
              widths[column.id] = flexColumnWidth;
            }
          });
          
          setColumnWidths(widths);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [tableWidth, visibleColumns]);

  const handleResizeStart = useCallback((e: React.MouseEvent, columnId: string) => {
    e.preventDefault();
    setResizingColumn(columnId);
    setResizeStartX(e.clientX);
    
    const handleResizeMove = (moveEvent: MouseEvent) => {
      if (resizingColumn) {
        const deltaX = moveEvent.clientX - resizeStartX;
        const newWidth = Math.max(
          columns.find(col => col.id === columnId)?.minWidth || 50, 
          columnWidths[columnId] + deltaX
        );
        
        const maxWidth = columns.find(col => col.id === columnId)?.maxWidth;
        const constrainedWidth = maxWidth ? Math.min(newWidth, maxWidth) : newWidth;
        
        setColumnWidths(prev => ({
          ...prev,
          [columnId]: constrainedWidth
        }));
        setResizeStartX(moveEvent.clientX);
      }
    };
    
    const handleResizeEnd = () => {
      setResizingColumn(null);
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  }, [resizingColumn, resizeStartX, columnWidths, columns]);

  const handleSort = useCallback((columnId: string) => {
    const column = columns.find(col => col.id === columnId);
    if (!column?.sortable) return;
    
    setSortConfig(prevSort => {
      if (prevSort?.key === columnId) {
        return prevSort.direction === 'asc'
          ? { key: columnId, direction: 'desc' }
          : null;
      }
      return { key: columnId, direction: 'asc' };
    });
  }, [columns]);

  const sortedData = useCallback(() => {
    if (!sortConfig) return data;
    
    return [...data].sort((a, b) => {
      const columnToSort = columns.find(col => col.id === sortConfig.key);
      if (!columnToSort) return 0;
      
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }
      
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortConfig.direction === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }
      
      return 0;
    });
  }, [data, sortConfig, columns]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        {emptyMessage}
      </div>
    );
  }

  const currentVisibleColumns = visibleColumns();

  return (
    <div 
      ref={containerRef}
      className={`${styles.tableContainer} ${className}`}
    >
      <table
        ref={tableRef}
        className={styles.table}
      >
        <thead className={styles.tableHeader}>
          <tr>
            {currentVisibleColumns.map((column) => (
              <th
                key={column.id}
                className={`${styles.tableHeaderCell} ${column.sortable ? styles.sortable : ''}`}
                style={{ width: columnWidths[column.id] ? `${columnWidths[column.id]}px` : 'auto' }}
              >
                <div 
                  className={`flex items-center ${column.sortable ? 'cursor-pointer' : ''}`}
                  onClick={() => column.sortable && handleSort(column.id)}
                >
                  <span className="truncate">{column.header}</span>
                  {column.sortable && (
                    <span className={`ml-1 ${styles.sortIcon} flex-shrink-0`}>
                      {sortConfig?.key === column.id ? (
                        sortConfig.direction === 'asc' ? (
                          <ChevronUpIcon className="h-4 w-4" />
                        ) : (
                          <ChevronDownIcon className="h-4 w-4" />
                        )
                      ) : (
                        <ArrowsUpDownIcon className="h-4 w-4 text-gray-300 group-hover:text-gray-400" />
                      )}
                    </span>
                  )}
                </div>
                
                <div
                  className={`${styles.resizeHandle} ${resizingColumn === column.id ? styles.resizeHandleActive : ''}`}
                  onMouseDown={(e) => handleResizeStart(e, column.id)}
                ></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData().map((row, index) => (
            <tr
              key={index}
              className={`
                ${styles.tableRow}
                ${onRowClick ? styles.tableRowClickable : ''}
                ${highlightRow && highlightRow(row) ? styles.tableRowHighlighted : ''}
              `}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {currentVisibleColumns.map((column) => (
                <td
                  key={column.id}
                  className={styles.tableCell}
                  style={{ width: columnWidths[column.id] ? `${columnWidths[column.id]}px` : 'auto' }}
                >
                  {column.accessor(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {isSmallScreen && columns.length > currentVisibleColumns.length && (
        <div className="text-xs text-gray-500 mt-2 text-center">
          <span>* Showing {currentVisibleColumns.length} of {columns.length} columns. Scroll horizontally to see more data.</span>
        </div>
      )}
    </div>
  );
} 