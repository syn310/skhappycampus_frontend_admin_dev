import React, { Component } from 'react';
import { Table, Icon, Grid, Button } from 'semantic-ui-react';
import dateTimeFormat from 'lib/dateTimeFormat';/** 날짜 포맷 변경 공통함수 */

const BookList = ({bookList, handleBookComplete}) => {

    return (
        <div>
            <Table celled>
                {/* Header 시작 */}
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell textAlign="center">NO.</Table.HeaderCell>
                        <Table.HeaderCell textAlign="center">도서명</Table.HeaderCell>
                        <Table.HeaderCell textAlign="center">희망사용자</Table.HeaderCell>
                        <Table.HeaderCell textAlign="center">지급여부</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                {/* Header 끝 */}
                {/* Body 시작 */}
                <Table.Body>
                    {bookList.map((object, i) => {
                        return (
                            <Table.Row key={i}>
                                <Table.Cell textAlign="center">{i+1}</Table.Cell>
                                <Table.Cell textAlign="left">{object.bookName}</Table.Cell>
                                <Table.Cell textAlign="left">{object.chooserId}</Table.Cell>
                                <Table.Cell textAlign="center">
                                    {object.completeYn === "Y" ? "나눔완료 (" + dateTimeFormat(object.completeDatetime) + ")"
                                        : <Button icon color='red' onClick={handleBookComplete} data-bookid={object.bookId} disabled={object.chooserId === null ? true : false}>완료저장</Button>
                                    }
                                </Table.Cell>
                            </Table.Row>
                        )
                    })}
                </Table.Body>
            </Table>
        </div>
    );
}

export default BookList;