import React, { Component } from 'react';
import { Header, Grid, Table, Button, Dropdown,
         Pagination, Segment, Container, Checkbox, Icon, Input } from 'semantic-ui-react'
import axios from 'axios';
import storage from 'lib/storage';
import dateTimeFormat from 'lib/dateTimeFormat';

import { FaqContentPopup } from 'components';

class FaqManageContainer extends Component {
    
    constructor(props) {
        super(props);
        this.state = { 
            faqOriginList: [],
            faqList: [],
            qnaCategoryCode: [],
            searchCategory:"",
            searchInput:"",
            openPopup: false,
            faqInfo:{
                faqQuestion:"",
                faqAnswer:"",
                faqSeq:"",
                faqCategory:""
            },
            popupType:""
        }
    }

    componentDidMount = () => {
        this.getFaqList();
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

    getFaqList = () => {

        axios({
            url:"/faq",
            method:"get",
            headers: { Pragma: 'no-cache',"x-access-token": storage.getToken()}
          })
          .then( (res) => {
            if(res.data){
                storage.setSessionObj(res.headers);
                this.setState({
                    faqList: res.data,
                    faqOriginList: res.data

                })
                //console.log(res.data)
            }
          }).catch(function(error) {
            console.log(error);
          });


    }

    changePopupCategory = (e, data) => {
        let input = this.state.faqInfo;;
        input["faqCategory"] = data.value;
        // console.log(input)
        this.setState({
            faqInfo: input
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
            faqInfo:{
                faqQuestion:"",
                faqAnswer:"",
                faqSeq:"",
                faqCategory:""
            }
        })
    }

    changePopupContent = (e) => {
        let input = this.state.faqInfo;;
        input[e.target.name] = e.target.value;
         console.log(input)
        this.setState({
            faqInfo: input
        })
        console.log(this.state.faqInfo)
    }

    clickNew = () => {
        this.setState({
            openPopup: true,
            popupType:"등록",
            faqInfo: {
                faqQuestion:"",
                faqAnswer:"",
                faqSeq:"",
                faqCategory:""
            }
        });
    }

    clickTitle = (e, data) => {
        const faqSeq = e.target.getAttribute("data-seq");
        const { faqOriginList } = this.state;
        const faqInfo = _.filter(faqOriginList, function(obj){
                            return obj.faqSeq==faqSeq
                        })[0]

        this.setState({
            openPopup: true,
            faqInfo,
            popupType:"수정"
            
        })
    
    }

    clickSearch = (e,data) => {
        const { searchCategory, faqOriginList, searchInput } = this.state;
        if(searchCategory.length > 0){
            // console.log('searchInput', searchInput)
            if(searchInput.length > 0){
                this.setState({
                    faqList: _.filter(faqOriginList, function(obj){
                                return obj.faqCategory==searchCategory && obj.faqQuestion.indexOf(searchInput) > -1}
                                )
                })
            }else
                this.setState({
                    faqList: _.filter(faqOriginList, function(obj){
                                return obj.faqCategory==searchCategory}
                                )
                })
        }
        else{
            if(searchInput.length > 0)
                this.setState({
                    faqList: _.filter(faqOriginList, function(obj){
                                return obj.faqQuestion.indexOf(searchInput) > -1}
                                )
                })
            else
                this.setState({
                    faqList: faqOriginList
                })
        }
    }

    saveContent = () => {

        const { faqInfo, popupType } = this.state; 
        const self = this;

        if(confirm("저장하시겠습니까?"))
            if(this.checkValidation())
                axios({
                    url: popupType==="등록" ? "/faq" : `/faq/${faqInfo.faqSeq}`,
                    method : popupType==="등록" ? "post" : "put",
                    data: { faqInfo },
                    headers: { "Pragma" : 'no-cache' , "x-access-token": storage.getToken()}
                }).then((res)=>{
                    if(res.data){
                        storage.setSessionObj(res.headers);
                        alert("저장되었습니다");
                        // self.clickClose();

                        self.setState({
                            searchCategory:"",
                            searchInput:"",
                            openPopup: false,
                            popupType:"",
                            faqInfo:{
                                faqQuestion:"",
                                faqAnswer:"",
                                faqSeq:"",
                                faqCategory:""
                            }
                        })

                        self.getCodeValue();
                        self.getFaqList()

                    }
                    // console.log("res", res)
                }).catch((err)=>{
                    console.log("err", err)
                })

    }


    deleteContent = (e, data) => {
        
        const faqSeq = data["data-seq"]
        const self = this;

        if(confirm("선택하신 항목을 삭제하시겠습니까?"))
            
            axios({
                url: `/faq/delete/${faqSeq}`,
                method : "put",
                // data: { updateUserId:"" },
                headers: { "Pragma" : 'no-cache', "x-access-token": storage.getToken() }
            }).then((res)=>{
                if(res.data){
                    storage.setSessionObj(res.headers);
                    alert("삭제되었습니다");
                    // self.clickClose();
                    self.setState({
                        searchCategory:"",
                        searchInput:"",
                        openPopup: false,
                        popupType:"",
                        faqInfo:{
                            faqQuestion:"",
                            faqAnswer:"",
                            faqSeq:"",
                            faqCategory:""
                        }
                    })
                    
                    self.getCodeValue();
                    self.getFaqList();

                }
                // console.log("res", res)
            }).catch((err)=>{
                console.log("err", err)
            })

    }


    checkValidation = () => {

        const { faqInfo } = this.state;

        if(faqInfo.faqCategory.length == 0){
            alert("카테고리s는 필수항목입니다");
            return;
        }
        if(faqInfo.faqQuestion.length == 0){
            alert("질문제목은 필수입력 항목입니다");
            return;
        }
        if(faqInfo.faqAnswer.length == 0){
            alert("답변내용은 필수입력 항목입니다");
            return;
        }

        return true;

    }

    render() { 

        const { faqList, 
                qnaCategoryCode, 
                searchCategory,
                searchInput, 
                openPopup,
                faqInfo,
                popupType } = this.state;
                
        const { clickSearch, 
                changeSelect, 
                changeInput, 
                pressEnterKey, 
                clickTitle, 
                clickClose,
                clickNew,
                changePopupContent,
                changePopupCategory,
                saveContent,
                deleteContent } = this;

        const generateFaqRow = dataList => {
            return dataList.map(
                (obj,idx)=>{
                    return (
                        <Table.Row key={obj.faqSeq}>
                            <Table.Cell textAlign="center">{obj.faqCategory}</Table.Cell>
                            <Table.Cell textAlign="left"><span  data-seq={obj.faqSeq} className="cell_title" onClick={clickTitle}>{obj.faqQuestion}</span></Table.Cell>
                            <Table.Cell textAlign="center">{dateTimeFormat(obj.createDatetime)}</Table.Cell>
                            <Table.Cell textAlign="center">{obj.updateDatetime ? dateTimeFormat(obj.updateDatetime) : ""}</Table.Cell>
                            <Table.Cell textAlign="center"><Button data-seq={obj.faqSeq} icon onClick={deleteContent}><Icon name='trash alternate' /></Button></Table.Cell>
                        </Table.Row>
                    )
                }
            )
        }

        return ( 

            <div>

                <FaqContentPopup 
                    openPopup={openPopup} 
                    clickClose={clickClose}
                    faqInfo={faqInfo}
                    changePopupContent={changePopupContent}
                    changePopupCategory={changePopupCategory}
                    qnaCategoryCode={qnaCategoryCode}
                    popupType={popupType}
                    saveContent={saveContent}
                    >
                </FaqContentPopup>

                <Grid container style={{ padding: '7em 0em 0em 0em' }}>
                    <Grid.Row>
                    <Grid.Column>
                        <Header as='h1' dividing>
                            FAQ 관리
                        </Header>
                    </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Container textAlign='right'>
                            <div style={{"width":"140px", "display":"inline-block"}} className='margin_right_5'>
                                <Dropdown id="selCategory" style={{"top":"1px"}}
                                    selection
                                    fluid
                                    value={searchCategory}
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
                                        <Table.HeaderCell textAlign="center" style={{"width":"140px"}}>등록일</Table.HeaderCell>
                                        <Table.HeaderCell textAlign="center" style={{"width":"140px"}}>수정일</Table.HeaderCell>
                                        <Table.HeaderCell textAlign="center" style={{"width":"80px"}}></Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                {/* Header 끝 */}
                                {/* Body 시작 */}
                                <Table.Body>    
                                    {generateFaqRow(faqList)}
                                </Table.Body>
                                {/* Body 끝 */}
                            </Table>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>            
                <Grid columns='equal' container>
                    <Grid.Column textAlign='right'>
                        <Button color='blue' onClick={clickNew}>등록</Button>
                    </Grid.Column>
                </Grid>
                {/* <Divider /> */}

            </div>
         );
    }
}
 
export default FaqManageContainer;