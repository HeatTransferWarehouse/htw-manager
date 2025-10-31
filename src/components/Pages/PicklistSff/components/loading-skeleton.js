import React from 'react';
import { TableCell, TableRow } from '../../../Table/Table';

function LoadingSkeleton({ limit }) {
  return Array.from({ length: limit }).map((_, index) => (
    <TableRow key={index} isMobile={false}>
      <TableCell className={'text-sm px-2'} minWidth={'4rem'} />
      <TableCell className={'text-sm px-2'} minWidth={'9rem'}>
        <span className="w-full bg-gray-300 rounded-md py-3 animate-pulse"></span>
      </TableCell>
      <TableCell className={'text-sm px-2'} minWidth={'7rem'}>
        <span className="w-full bg-gray-300 rounded-md py-3 animate-pulse"></span>
      </TableCell>
      <TableCell className={'text-sm px-2'} minWidth={'5rem'}>
        <span className="w-full bg-gray-300 rounded-md py-3 animate-pulse"></span>
      </TableCell>
      <TableCell className={'text-sm px-2'} minWidth={'10rem'}>
        <span className="w-full bg-gray-300 rounded-md py-3 animate-pulse"></span>
      </TableCell>
      <TableCell className={'text-sm px-2 '} minWidth={'10rem'}>
        <span className="w-full bg-gray-300 rounded-md py-3 animate-pulse"></span>
      </TableCell>
      <TableCell className={'text-sm px-2'} minWidth={'10rem'}>
        <span className="w-full bg-gray-300 rounded-md py-3 animate-pulse"></span>
      </TableCell>
      <TableCell className={'text-sm px-2'} minWidth={'10rem'}>
        <span className="w-full bg-gray-300 rounded-md py-3 animate-pulse"></span>
      </TableCell>
      <TableCell className={'text-sm px-2'} minWidth={'8rem'}>
        <span className="w-full bg-gray-300 rounded-md py-3 animate-pulse"></span>
      </TableCell>
      <TableCell className={'text-sm px-2'} minWidth={'4.5rem'}>
        <span className="w-full bg-gray-300 rounded-md py-3 animate-pulse"></span>
      </TableCell>
      <TableCell className={'text-sm px-2'} minWidth={'8rem'}>
        <span className="w-full bg-gray-300 rounded-md py-3 animate-pulse"></span>
      </TableCell>
      <TableCell className={'text-sm px-2'} minWidth={'7rem'}>
        <span className="w-full bg-gray-300 rounded-md py-3 animate-pulse"></span>
      </TableCell>
      <TableCell className={'text-sm px-2'} minWidth={'7rem'}>
        <span className="w-full bg-gray-300 rounded-md py-3 animate-pulse"></span>
      </TableCell>
    </TableRow>
  ));
}

export default LoadingSkeleton;
