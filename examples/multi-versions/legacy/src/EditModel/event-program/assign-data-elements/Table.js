import React, { PropTypes } from 'react';

export const Table = ({ children, ...props }) => (
    <table {...props} style={{
        padding: '0 3rem',
        borderSpacing: 0,
        width: '100%',
    }}>
        {children}
    </table>
)

Table.Head = ({ children, ...props }) => (
    <thead {...props} style={{
        textAlign: 'left',
        verticalAlign: 'top',
    }}>
        {children}
    </thead>
)

Table.Body = ({ children, ...props }) => (
    <tbody {...props}>
        {children}
    </tbody>
)

Table.Row = ({ children, ...props }) => (
    <tr {...props}>
        {children}
    </tr>
)

Table.CellHead = ({ children, style, ...props }) => (
    <th {...props} style={{
        height: '56px',
        padding: '0 5px 10px',
    }}>
        {children}
    </th>
)

Table.Cell = ({ children, style, ...props }) => (
    <td {...props} style={{
        padding: '10px 5px',
        borderTop: '1px solid #bdbdbd',
        ...(style || {}),
    }}>
        {children}
    </td>
)
