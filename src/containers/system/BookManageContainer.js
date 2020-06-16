import React, { Component } from 'react';
import { BookList } from 'components';
import { Header, Grid } from 'semantic-ui-react'
import axios from 'axios';
import storage from 'lib/storage';
import devtest from 'lib/devtest';

class BookManageContainer extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            allBookList: []
        };
    }

    componentDidMount() {
        // 모든 책 목록 조회
        this.handleGetAllBookList();
    }

    handleGetAllBookList = () => {
        const self = this;
        
        axios({
            url: devtest() + `/book`,
            method: 'get',
            headers: {  "Pragma": 'no-cache',
                        "x-access-token": storage.getToken() 
                     }
        }).then( 
            (res) => {
                storage.setSessionObj(res.headers);
                self.setState({
                    allBookList: res.data
                 });
            }
        ).catch(function(error) {
            console.log(error);
        });
    }

    handleBookComplete = (e) => {
        const self = this;
        const bookId =  e.currentTarget.getAttribute("data-bookid");

        if(confirm("지급완료 저장하시겠습니까?"))
            axios({
                url: devtest() + `/book/${bookId}`,
                method: 'put',
                headers: {  "Pragma": 'no-cache',
                            "x-access-token": storage.getToken()
                        }
            }).then(
                (res) => {
                    storage.setSessionObj(res.headers);
                    this.handleGetAllBookList();
                    alert("저장되었습니다.");
                }
            ).catch(function(error) {
                console.log(error);
            });
    }

    render() {
        const { handleBookComplete } = this;
        const { allBookList } = this.state;

        console.log(allBookList);

        return (
            <div>
                <Grid container style={{ padding: '7em 0em 0em 0em' }}>
                    <Grid.Row>
                    <Grid.Column>
                        <Header as='h1' dividing>
                            도서나눔 관리
                        </Header>
                    </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column>
                            <BookList bookList={allBookList} handleBookComplete={handleBookComplete}></BookList>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </div>
        );
    }

}

export default BookManageContainer;