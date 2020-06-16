import React, { Component } from 'react';
import { Header, Grid, Table, Button, Dropdown,
         Pagination, Segment, Container, Checkbox, Icon, Input } from 'semantic-ui-react'
import axios from 'axios';
import storage from 'lib/storage';
import dateTimeFormat from 'lib/dateTimeFormat';

import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as menuActions from 'modules/menu';
import { QnaContentPopup } from 'components';

class QnaManageContainer extends Component {
    
    constructor(props) {
        super(props);
        this.state = { 
            qnaOriginList: [],
            qnaList: [],
            qnaCategoryCode: [],
            searchCategory:"",
            searchInput:"",
            openPopup: false,
            qnaInfo:{
                qnaQuestion:"",
                qnaAnswer:"",
                qnaSeq:"",
                qnaCategory:""
            },
            popupType:""
        }
    }

    componentDidMount = () => {
        this.getQnaList();
        this.getCodeValue();
    }

    /** 질문카테고리 코드데이터 조회 */
    getCodeValue = () => {

        axios({
            url:`/commonCode/QUESTION/A`,//코드 URL은 뒤에 주소 대문자 사용함
            method : 'get',
            headers: { Pragma: 'no-cache'}
        }).then(
            (res)=>{
                if(res.data){
                    //console.log("code", res.data)
                    this.setState({
                        qnaCategoryCode: res.data
                    })
                }
            }
        ).catch(
            (err)=>{ if(err) console.log("코드 get err", err.response); }
        )

    }

    getQnaList = (header) => {
        console.log(header)
        axios({
            url:"/qna",
            method:"get",
            headers: { Pragma: 'no-cache', "x-access-token": (header !== undefined ? header.newtoken: storage.getToken())}
          })
          .then( (res) => {
            if(res.data){
                storage.setSessionObj(res.headers);
                this.setState({
                    qnaList: res.data,
                    qnaOriginList: res.data

                })
                //console.log(res.data)
            }
          }).catch(function(error) {
            console.log(error);
          });


    }

    changePopupCategory = (e, data) => {
        let input = this.state.qnaInfo;;
        input["qnaCategory"] = data.value;
        // console.log(input)
        this.setState({
            qnaInfo: input
        })
    }

    changeSelect = (e,data) => {
        this.setState({
            searchCategory: data.value
        })
    }

    changeInput = (e) => {
        this.setState({
            searchInput: e.target.value 
        })
    }

    pressEnterKey = (e) => {
        if(e.charCode === 13){
            this.clickSearch();
        }
    }

    clickClose = () => {
        this.setState({
            openPopup: false,
            popupType:"",
            qnaInfo:{
                qnaQuestion:"",
                qnaAnswer:"",
                qnaSeq:"",
                qnaCategory:""
            }
        })
    }

    changePopupContent = (e) => {
        let input = this.state.qnaInfo;;
        input[e.target.name] = e.target.value;
        this.setState({
            qnaInfo: input
        })
    }

    qnaAnswerSave = (e, data) => {
        const qnaSeq = e.target.getAttribute("data-seq");
        const { qnaOriginList } = this.state;
        const qnaInfo = _.filter(qnaOriginList, function(obj){
                            return obj.qnaSeq==qnaSeq
                        })[0]

        this.setState({
            openPopup: true,
            qnaInfo,
            popupType:"등록"
            
        })
    }

    qnaAnswerModify = (e, data) => {
        const qnaSeq = e.target.getAttribute("data-seq");
        const { qnaOriginList } = this.state;
        const qnaInfo = _.filter(qnaOriginList, function(obj){
                            return obj.qnaSeq==qnaSeq
                        })[0]

        this.setState({
            openPopup: true,
            qnaInfo,
            popupType:"수정"
            
        })
    
    }

    clickSearch = (e,data) => {
        const { searchCategory, qnaOriginList, searchInput } = this.state;
        if(searchCategory.length > 0){
            if(searchInput.length > 0){
                this.setState({
                    qnaList: _.filter(qnaOriginList, function(obj){
                                return obj.qnaCategory==searchCategory && obj.qnaQuestion.indexOf(searchInput) > -1}
                                )
                })
            }else
                this.setState({
                    qnaList: _.filter(qnaOriginList, function(obj){
                                return obj.qnaCategory==searchCategory}
                                )
                })
        }
        else{
            if(searchInput.length > 0)
                this.setState({
                    qnaList: _.filter(qnaOriginList, function(obj){
                                return obj.qnaQuestion.indexOf(searchInput) > -1}
                                )
                })
            else
                this.setState({
                    qnaList: qnaOriginList
                })
        }
    }

    saveContent = () => {

        const { qnaInfo } = this.state; 
        const self = this;

        if(confirm("저장하시겠습니까?"))
            if(this.checkValidation())
                axios({
                    url:`/qna/qnaAnswer/${qnaInfo.qnaSeq}`,
                    method : "put",
                    data: { qnaInfo },
                    headers: { "Pragma" : 'no-cache' , "x-access-token": storage.getToken()}
                }).then((res)=>{
                    if(res.data){
                        storage.setSessionObj(res.headers);
                        this.handleCheckNewQnaYn(res.headers);
                        alert("저장되었습니다");
                        self.clickClose();
                        self.getCodeValue();
                    }
                }).catch((err)=>{
                    console.log("err", err)
                })

    }

    /** 1:1문의 답변할 글 여부 체크 */
    handleCheckNewQnaYn = (header) => {

        const { MenuActions } = this.props;
        const {getQnaList} = this;

        axios({
            url:"/qna/checkNewQna",
            method:"get",
            headers: { "Pragma": 'no-cache',
                   "x-access-token": (header !== undefined ? header.newtoken: storage.getToken())} //session storage에서 저장된 token을 빼와서 token을 전달.
        })
        .then( (response) => {
            if (response.data){
                storage.setSessionObj(response.headers);
                // let qnaAnswerYn = response.data;

                //조회한 데이터 store에 셋팅
                MenuActions.setQnaStatusMenu(response.data);
                getQnaList(response.headers);
                
            }
        }).catch(function(error) {
            console.log(error.response);
        });
    }


    deleteContent = (e, data) => {
        
        const qnaSeq = data["data-seq"]
        // console.log(e.target)
        // console.log(data)
        const self = this;

        if(confirm("선택하신 항목을 삭제하시겠습니까?"))
            
            axios({
                url: `/qna/delete/${qnaSeq}`,
                method : "put",
                // data: { updateUserId:"" },
                headers: { "Pragma" : 'no-cache', "x-access-token": storage.getToken() }
            }).then((res)=>{
                if(res.data){
                    storage.setSessionObj(res.headers);
                    alert("삭제되었습니다");
                    self.clickClose();
                    self.getCodeValue();
                    self.getQnaList(res.headers);

                }
                // console.log("res", res)
            }).catch((err)=>{
                console.log("err", err)
            })

    }


    checkValidation = () => {

        const { qnaInfo } = this.state;

        if(qnaInfo.qnaCategory.length == 0){
            alert("QNA 카테고리를 선택하세요");
            return;
        }
        if(qnaInfo.qnaQuestion.length == 0){
            alert("QNA 제목을 입력하세요");
            return;
        }
        if(qnaInfo.qnaAnswer.length == 0){
            alert("QNA 답변내용을 입력하세요");
            return;
        }

        return true;

    }

    render() { 

        const { qnaList, 
                qnaCategoryCode, 
                searchInput, 
                openPopup,
                qnaInfo,
                popupType } = this.state;
                
        const { clickSearch, 
                changeSelect, 
                changeInput, 
                pressEnterKey, 
                qnaAnswerModify, 
                clickClose,
                qnaAnswerSave,
                changePopupContent,
                changePopupCategory,
                saveContent,
                deleteContent } = this;

        const generateQnaRow = dataList => {
            return dataList.map(
                (obj,idx)=>{
                    
                    let questionTitle = <span  data-seq={obj.qnaSeq} className="cell_title" onClick={qnaAnswerModify}>{obj.qnaQuestion}</span>
                    let answerYnText = <span  data-seq={obj.qnaSeq} className="cell_title" onClick={qnaAnswerSave}>답변하기</span>
                    

                    return (
                        <Table.Row key={obj.qnaSeq}>
                            <Table.Cell textAlign="center">{obj.qnaCategory} </Table.Cell>
                            <Table.Cell textAlign="left">{obj.answerYn === "N" ? obj.qnaQuestion: questionTitle}</Table.Cell>
                            <Table.Cell textAlign="center">{obj.createUserId}</Table.Cell>
                            <Table.Cell textAlign="center">{dateTimeFormat(obj.createDatetime)}</Table.Cell>
                            <Table.Cell textAlign="center">{obj.answerYn === "Y" ? "답변완료": answerYnText}</Table.Cell>
                        </Table.Row>
                    )
                }
            )
        }

        return ( 
            <div>

                <QnaContentPopup 
                    openPopup={openPopup} 
                    clickClose={clickClose}
                    qnaInfo={qnaInfo}
                    changePopupContent={changePopupContent}
                    changePopupCategory={changePopupCategory}
                    qnaCategoryCode={qnaCategoryCode}
                    popupType={popupType}
                    saveContent={saveContent}
                    >
                </QnaContentPopup>

                <Grid container style={{ padding: '7em 0em 0em 0em' }}>
                    <Grid.Row>
                    <Grid.Column>
                        <Header as='h1' dividing>
                            1:1 문의관리
                        </Header>
                    </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Container textAlign='right'>
                            <div style={{"width":"140px", "display":"inline-block"}} className='margin_right_5'>
                                <Dropdown id="selCategory" style={{"top":"1px"}}
                                    selection
                                    fluid
                                    placeholder="전체"
                                    onChange={changeSelect}
                                    options={qnaCategoryCode}></Dropdown>
                            </div>
                            <div style={{"display":"inline-block"}}>
                                <Input placeholder="질문검색" value={searchInput} onChange={changeInput} onKeyPress={pressEnterKey} className='margin_right_5'></Input>
                                <Button icon onClick={clickSearch}>
                                    <Icon name='search' />
                                </Button>
                            </div>
                        </Container>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column>
                            <Table celled fixed singleLine>
                                {/* Header 시작 */}
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell textAlign="center" style={{"width":"140px"}}>카테고리</Table.HeaderCell>
                                        <Table.HeaderCell textAlign="center">질문</Table.HeaderCell>
                                        <Table.HeaderCell textAlign="center" style={{"width":"140px"}}>문의자</Table.HeaderCell>
                                        <Table.HeaderCell textAlign="center" style={{"width":"140px"}}>문의일시</Table.HeaderCell>
                                        <Table.HeaderCell textAlign="center" style={{"width":"80px"}}>답변여부</Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                {/* Header 끝 */}
                                {/* Body 시작 */}
                                <Table.Body>    
                                    {generateQnaRow(qnaList)}
                                </Table.Body>
                                {/* Body 끝 */}
                            </Table>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>            
                {/* <Divider /> */}

            </div>
         );
    }
}

export default withRouter(connect(
    (state) => ({
        qnaStatusMenu: state.menu.get('qnaStatusMenu')
    }), (dispatch) => ({
        MenuActions : bindActionCreators(menuActions, dispatch)
    })
)(QnaManageContainer));