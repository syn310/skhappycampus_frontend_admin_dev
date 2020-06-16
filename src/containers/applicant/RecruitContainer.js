import React, { Component } from 'react';
import { Header, Grid, Table, Button, Pagination, Segment, Container, Checkbox, Icon, Message } from 'semantic-ui-react'
import { RecruitPopup } from 'components';
import { dateFormat, dateBarFormat } from 'lib/dateFormat';
import closest from 'lib/closest';
import storage from 'lib/storage';
import axios from 'axios';
import _ from 'lodash';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as recruitActions from 'modules/recruit';

class RecruitContainer extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            currentPageIndex: 1,
            openPopup: false,
            recruitInfo: {
                serialNumber:"",
                noticeName:"",
                noticeStartDatetime:"",
                noticeEndDatetime:"",
                documentResultDate:"",
                interviewResultDate:"",
                noticeStatus:"시작전",
                description:""
            },
            serialNumber: {
                location:"",
                department:""
            },
            recruitList: [],
            popupType: "", //수정, 등록
            selectedRow: [],
            totalCount: 0,//총 데이터 수
            totalPages: 5, //총 페이지
            rowsPerPage: 2, //한 페이지의 row수
        }
    }

    componentDidMount = (e) => {
        this.getNoticeList();
    }

    getNoticeList = (e) => {

        const self = this;

        axios({
            url:"/recruitNotice",
            method : "get",
            headers: { "Pragma" : 'no-cache' ,"x-access-token": storage.getToken() }
        }).then((res)=>{
            if(res.data){
                //console.log(res.data)
                storage.setSessionObj(res.headers);
                self.setState({
                    recruitList: res.data
                })
            }
            //console.log(res.data)
        }).catch((err)=>{
            console.log(err)
        })

    }

    handleInputChange = (e) => {
        let { recruitInfo } = this.state;
        recruitInfo[e.target.name] = e.target.value;
        this.setState({recruitInfo});

    }

    handleDateChange = (res,e) => {
        let { recruitInfo } = this.state;
        const targetNm = closest(e, "td").getAttribute("name");
        recruitInfo[targetNm] = dateFormat(res);
        this.setState({recruitInfo});
    }

    handleSelectChange = (e, data) => {
        let { serialNumber } = this.state;
        serialNumber[data.name] = data.value;
        this.setState({serialNumber});
    };

    handleNoticeStatusChange = (e, data) => {
        let { recruitInfo } = this.state;
        recruitInfo[data.name] = data.value;
        this.setState({recruitInfo});
    }

    clickPageIndex = (e) => {
        this.setState({
            currentPageIndex: e.target.innerText,
        });

    }

    clickTitle = (e) => {
        this.setState({
            openPopup: true,
            recruitInfo: _.filter(this.state.recruitList, function(obj){
                                    return obj.serialNumber===e.target.getAttribute("data-sn")}
                                )[0],
            popupType:"수정"
        });
    }

    clickClose = () => {
        this.setState({
            openPopup: false,
            recruitInfo: {
                serialNumber:"",
                noticeName:"",
                noticeStartDatetime:"",
                noticeEndDatetime:"",
                documentResultDate:"",
                interviewResultDate:"",
                noticeStatus:"시작전",
                description:""
            },
            serialNumber: {
                location:"",
                department:"",
            }
        });
    }


    clickNew = () => {
        this.setState({
            openPopup: true,
            popupType:"등록",
            recruitInfo: {
                serialNumber:"",
                noticeName:"",
                noticeStartDatetime:"",
                noticeEndDatetime:"",
                documentResultDate:"",
                interviewResultDate:"",
                noticeStatus:"시작전",
                description:""
            },
            serialNumber: {
                location:"",
                department:"",
            }
        });
    }


    clickCheck = (e) => {

        let { selectedRow } = this.state;

        if(e.currentTarget.className.indexOf("checked") == -1){ // 체크하는경우
            selectedRow.push(e.currentTarget.getAttribute("data-sn"))
            this.setState({
                selectedRow
            })
        } 
        else{ //체크푸는경우
            _.remove(selectedRow, function(n) {
                return n==e.currentTarget.getAttribute("data-sn");
            });

            this.setState({
                selectedRow
            })
        } 

    }

    saveContent = (e) => {

        const self = this;
        const dt = new Date();
        const { recruitInfo, serialNumber, popupType } = this.state;
        
        //console.log("recruitInfo", recruitInfo)
        //console.log("serialNumber", serialNumber)

        if(confirm("저장하시겠습니까?"))
            if(this.checkValidation()){
                if(popupType==="등록")
                    recruitInfo.serialNumber = `${dt.getFullYear()}-${serialNumber.department}-${serialNumber.location}`;  

                axios({
                    url: popupType==="등록" ? "/recruitNotice" : `/recruitNotice/${recruitInfo.serialNumber}`,
                    method : popupType==="등록" ? "post" : "put",
                    data: { recruitInfo },
                    headers: { "Pragma" : 'no-cache', "x-access-token": storage.getToken() }
                }).then((res)=>{
                    if(res.data){
                        storage.setSessionObj(res.headers);
                        alert("저장되었습니다");
                        self.clickClose();
                        self.getNoticeList();

                    }
                    // console.log("res", res)
                }).catch((err)=>{
                    console.log("err", err)
                })

            }

    }

    checkValidation = () => {
        const { recruitInfo, serialNumber, popupType } = this.state;

        if(recruitInfo.noticeName.length == 0){
            alert("공고명은 필수입력 항목입니다");
            return;
        }
        if(popupType==="등록") {
            if(serialNumber.location.length == 0){
                alert("지역은 필수입력 항목입니다");
                return;
            }
            if(serialNumber.department.length == 0){
                alert("채용분야는 필수입력 항목입니다");
                return;
            }
        }
        if(recruitInfo.noticeStartDatetime.length == 0){
            alert("공고시작일은 필수입력 항목입니다");
            return;
        }
        if(recruitInfo.noticeEndDatetime.length == 0){
            alert("공고종료일은 필수입력 항목입니다");
            return;
        }
        if(recruitInfo.noticeStatus.length == 0){
            alert("공고상태은 필수입력 항목입니다");
            return;
        }
        return true;
    }

    deleteContent = (e, data) => {
        
        const noticeStatus = closest(e, "tr").childNodes[4].innerText; 
        const serialNumber = closest(e, "tr").childNodes[0].innerText; 
        const self = this;

        if(noticeStatus==="진행중"){
            alert("진행중인 공고는 삭제할 수 없습니다");
            return;
        }

        if(confirm("선택하신 공고를 삭제하시겠습니까?"))
            
            axios({
                url: `/recruitNotice/delete/${serialNumber}`,
                method : "put",
                data: { updateUserId:"test" },
                headers: { "Pragma" : 'no-cache', "x-access-token": storage.getToken() }
            }).then((res)=>{
                if(res.data){
                    storage.setSessionObj(res.headers);
                    alert("삭제되었습니다");
                    self.clickClose();
                    self.getNoticeList();

                }
                // console.log("res", res)
            }).catch((err)=>{
                console.log("err", err)
            })

    }

    clickDetailPage = (e) => {
        const { RecruitActions } = this.props;
        
        const serialNumber = closest(e, "tr").childNodes[0].innerText; 
        const recruitInfo = _.filter(this.state.recruitList, function(obj){
                                        return obj.serialNumber===serialNumber}
                                    )[0] ;
        // console.log(serialNumber)
        RecruitActions.setRecruitInfo(recruitInfo);
        RecruitActions.setSerialNumber(serialNumber);
        this.props.history.push("/applicant/detail")
    }

    render() { 

        const { currentPageIndex,
                recruitInfo,
                recruitList,
                popupType,
                totalPages } = this.state;
        const { clickPageIndex,
                clickClose,
                clickTitle,
                clickNew,
                saveContent,
                deleteContent,
                handleInputChange,
                handleDateChange,
                handleSelectChange,
                handleNoticeStatusChange,
                clickDetailPage } = this;
        
        const generateTblRow = dataList => {
            return dataList.map(
                (obj,idx)=>{
                    return (
                        <Table.Row key={obj.serialNumber}>
                            <Table.Cell textAlign="center">{obj.serialNumber}</Table.Cell>
                            <Table.Cell><span className="cell_title" onClick={clickTitle} data-sn={obj.serialNumber}>{obj.noticeName}</span></Table.Cell>
                            <Table.Cell textAlign="center">{dateBarFormat(obj.noticeStartDatetime)}</Table.Cell>
                            <Table.Cell textAlign="center">{dateBarFormat(obj.noticeEndDatetime)}</Table.Cell>
                            <Table.Cell textAlign="center">{obj.noticeStatus}</Table.Cell>
                            <Table.Cell textAlign="center"><Button color='green' onClick={clickDetailPage}>이동</Button></Table.Cell>
                            <Table.Cell textAlign="center" width="2">{obj.noticeStatus === "시작전" ?
                                <Button icon color='red' onClick={deleteContent}><Icon name='trash alternate' />삭제</Button> 
                                : <Button icon color='red' disabled={true}><Icon name='trash alternate' />삭제</Button>
                            }</Table.Cell>
                        </Table.Row>
                    )
                }
            )
        }

        return ( 


            <div>
            
            {/* 팝업 */}
            <RecruitPopup   openPopup={this.state.openPopup} 
                            clickClose={clickClose} 
                            recruitInfo={recruitInfo}
                            handleInputChange={handleInputChange}
                            popupType={popupType}
                            handleSelectChange={handleSelectChange}
                            handleDateChange={handleDateChange}
                            handleNoticeStatusChange={handleNoticeStatusChange}
                            saveContent={saveContent}
            />


            <Grid container style={{ padding: '7em 0em 0em 0em' }}>
                <Grid.Row>
                <Grid.Column>
                    <Header as='h1' dividing>
                    모집공고 관리
                    </Header>
                </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column>
                        <Table celled padded>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell textAlign="center">Serial No.</Table.HeaderCell>
                                    <Table.HeaderCell textAlign="center">공고명</Table.HeaderCell>
                                    <Table.HeaderCell textAlign="center">공고시작일</Table.HeaderCell>
                                    <Table.HeaderCell textAlign="center">공고종료일</Table.HeaderCell>
                                    <Table.HeaderCell textAlign="center">공고상태</Table.HeaderCell>
                                    <Table.HeaderCell textAlign="center" style={{"width":"110px"}}>지원현황</Table.HeaderCell>
                                    <Table.HeaderCell style={{"width":"80px"}}></Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>

                            <Table.Body>
                                {generateTblRow(recruitList)}
                            </Table.Body>
                                    {/* Body 끝 */}
                            <Table.Footer >
                                <Table.Row >
                                    <Table.HeaderCell colSpan='7' >
                                        <Pagination floated='right'
                                        // boundaryRange={0}
                                        defaultActivePage={1}
                                        ellipsisItem={null}
                                        // firstItem={null}
                                        // lastItem={null}
                                        siblingRange={1}
                                        totalPages={totalPages} /** 총 페이지 수 */
                                        // activePage={this.state.currentPage}
                                        // onPageChange={this.handlePageChange}
                                    />
                                    </Table.HeaderCell>
                                </Table.Row>
                            </Table.Footer>
                        </Table>
                    </Grid.Column>
                </Grid.Row>
            </Grid>

            <Grid columns='equal' container>
                <Grid.Column textAlign='right'>
                    <Button onClick={clickNew} color='blue'>등록</Button>
                    {/* <Button primary>삭제</Button> */}
                </Grid.Column>
            </Grid>
            {/* <Divider /> */}

            </div>


          
        );
    }
}

export default connect(
    //props로 넣어줄 스토어 상태값
    (state) => ({
    })
    //props로 넣어줄 액션 생성함수
    , (dispatch) => ({
        RecruitActions: bindActionCreators(recruitActions, dispatch),
    })
)(RecruitContainer);
 