import React, { Component } from 'react';
import { Header, Grid, Table, Button, Pagination, Segment, Container, Checkbox, Icon, Message } from 'semantic-ui-react'
import { dateFormat, dateBarFormat } from 'lib/dateFormat';
import storage from 'lib/storage';
import axios from 'axios';
import _ from 'lodash';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as recruitActions from 'modules/recruit';
import ReactTable from "react-table";
import "react-table/react-table.css";
import iconDetail from 'public/assets/img/icon_btn_search.png';
import iconDownload from 'public/assets/img/icon_btn_down.png';
import { CSVLink, CSVDownload } from "react-csv";

class RecruitDetailContainer extends Component {

    constructor(props) {
        super(props);

        this.state = { 
            serialNumber:"",
            recruitInfo:{},
            summaryInfo: {
                total:"",
                complete:"",
                documentPass:"",
                interviewPass:"",
                finalPass:"",
            },
            todayInfo: {
                applying:"",
                resume:"",
                choice:"",
                submit:""
            },
            companyRank: [],
            schoolRank: [],
            applyUserList:[],
            today: "",
            applyUserListHeader: []
         }
    }

    componentDidMount = () => {

        const dt = new Date();
        const { serialNumber, recruitInfo } = this.props;

        this.setState({
            serialNumber,
            recruitInfo,
            today: this.getFormatDate(dt)
        })
        //지원자현황
        this.getApplyUserList(serialNumber);
    }

    clickApplyDetail = (rowInfo) => {
        const { RecruitActions } = this.props;
        const { applyUserId, serialNumber } = rowInfo.value;

        RecruitActions.setApplyUserId(applyUserId);
        RecruitActions.setSerialNumber(serialNumber);
        this.props.history.push("/applicant/applyuser")
    }

    getFormatDate = (date) => { 
        var year = date.getFullYear();	//yyyy 
        var month = (1 + date.getMonth());	//M 
        month = month >= 10 ? month : '0' + month;	
        //month 두자리로 저장 
        var day = date.getDate();	//d 
        day = day >= 10 ? day : '0' + day;	//day 두자리로 저장 
        return year + '/' + month + '/' + day; 
    }

    /** 지원자 현황 */
    getApplyUserList = (serialNumber) => {
        const {getCompanyRanking} =this;
        axios({
            url:"/recruitNotice/applyUserList/" + serialNumber,
            method : "get",
            headers: { "Pragma" : 'no-cache', "x-access-token": storage.getToken() }
        }).then((res)=>{
            storage.setSessionObj(res.headers);
            getCompanyRanking(serialNumber, res.headers)
            if(res.data){
                this.setState({
                    applyUserList: res.data
                })
            }
        }).catch((err)=>{
            console.log(err)
        })

    }
    /** 회사별 지원현황 */
    getCompanyRanking = (serialNumber, header) => {
        const {getSchoolRanking} = this;
        axios({
            url:"/recruitNotice/companyRank/" + serialNumber,
            method : "get",
            headers: { "Pragma" : 'no-cache' , "x-access-token": header.newtoken }
        }).then((res)=>{
            storage.setSessionObj(res.headers);
            getSchoolRanking(serialNumber,res.headers);
            if(res.data){
                this.setState({
                    companyRank: res.data
                })
            }
        }).catch((err)=>{
            console.log(err)
        })

    }
    /** 학교별 지원순위 */
    getSchoolRanking = (serialNumber, header) => {
        const {getRecruitSummary} =this;
        axios({
            url:"/recruitNotice/schoolRank/" + serialNumber,
            method : "get",
            headers: { "Pragma" : 'no-cache' , "x-access-token": header.newtoken }
        }).then((res)=>{
            storage.setSessionObj(res.headers);
            getRecruitSummary(serialNumber, res.headers);
            if(res.data){
                this.setState({
                    schoolRank: res.data
                })
            }
        }).catch((err)=>{
            console.log(err)
        })

    }
    /** 지원현황 통계 */
    getRecruitSummary = (serialNumber, header) => {
        const {getTodaySummary} = this;
        axios({
            url:"/recruitNotice/summary/" + serialNumber,
            method : "get",
            headers: { "Pragma" : 'no-cache', "x-access-token": header.newtoken}
        }).then((res)=>{
            storage.setSessionObj(res.headers);
            getTodaySummary(serialNumber, res.headers);
            if(res.data){
                this.setState({
                    summaryInfo:{
                        total:res.data[0].total,
                        complete:res.data[0].complete,
                        documentPass:res.data[0].document,
                        interviewPass:res.data[0].interview,
                        finalPass:res.data[0].final

                    }
                })
            }
        }).catch((err)=>{
            console.log(err)
        })

    }
    /** 금일 지원자수 */
    getTodaySummary = (serialNumber, header) => {
        axios({
            url:"/recruitNotice/today/" + serialNumber,
            method : "get",
            headers: { "Pragma" : 'no-cache', "x-access-token": header.newtoken }
        }).then((res)=>{
            storage.setSessionObj(res.headers);
            if(res.data){
                this.setState({
                    todayInfo:{
                        applying:res.data[0].applying,
                        resume:res.data[0].resume,
                        choice:res.data[0].choice,
                        submit:res.data[0].submit
                    }
                })
            }
        }).catch((err)=>{
            console.log(err)
        })

    }

    clickBack = () => {
        this.props.history.push("/applicant/recruit")
    }

    render() { 

        const { recruitInfo, 
                summaryInfo, 
                today, 
                todayInfo, 
                companyRank, 
                schoolRank,
                applyUserList } = this.state;
        const { clickApplyDetail,
                clickBack} = this;

        const mainTitle = {"fontSize":"16pt", "fontWeight":"600"};
        const subTitle = {"fontSize":"13pt", "fontWeight":"600"};
        const contents = {"fontSize":"12pt", "fontWeight":"500"};

        const headerClass =  {
            "height":"40px",
            "fontWeight":"bold", 
            "paddingTop":"9px"
        }
    
        const textCenter = {
            "textAlign":"center"
        }
    
        const textCenterBold = {
            "textAlign":"center",
            "fontWeight":"bold"
        }
    
        const textLeft = {
            "textAlign":"left"
        }

        
        const applyUserListHeader= [
            { label: "공고번호", key: "serialNumber", width: 300 },
            { label: "아이디", key: "applyUserId", style:textCenter },
            { label: "생년월일", key: "applyBirth", style:textCenter },
            { label: "성명", key: "applyName", style:textCenter },
            { label: "최종학력", key: "applySchool", style:textCenter },
            { label: "현재단계", key: "applyStatus", style:textCenter },
			{ label: "지원날짜", key: "createDatetime", style:textCenter },
            { label: "1지망", key: "firstCompany", style:textCenter },
            { label: "2지망", key: "secondCompany", style:textCenter },
            { label: "3지망", key: "thirdCompany", style:textCenter }
        ];
        
        const prettyLink  = {
           // backgroundColor: '#8dc63f',
            fontSize: 14,
            height: 52,
            padding: '0 5px',
            borderRadius: 5,
            color: '#fff'
          };

        const generateCompanyRankingRow = dataList => {
            return dataList.map(
                (obj,idx)=>{
                    return (
                        <Table.Row key={obj.companyId}>
                            <Table.Cell textAlign="center">{obj.companyName}</Table.Cell>
                            <Table.Cell textAlign="center">{obj.recruitNumber}</Table.Cell>
                            <Table.Cell textAlign="center">{obj.cnt}</Table.Cell>
                            <Table.Cell textAlign="center">{obj.first}</Table.Cell>
                            <Table.Cell textAlign="center">{obj.second}</Table.Cell>
                            <Table.Cell textAlign="center">{obj.third}</Table.Cell>
                        </Table.Row>
                    )
                }
            )
        }

        const noCompanyRankingRow = 
            <Table.Row>
                <Table.Cell textAlign="center" colSpan="6">데이터가 존재하지 않습니다</Table.Cell>
            </Table.Row>;

        const generateSchoolRankingRow = dataList => {
            return dataList.map(
                (obj,idx)=>{
                    return (
                        <Table.Row key={obj.schoolName}>
                            <Table.Cell textAlign="center">{obj.schoolName}</Table.Cell>
                            <Table.Cell textAlign="center">{obj.schoolCnt}</Table.Cell>
                        </Table.Row>
                    )
                }
            )
        }

        const noSchoolRankingRow = 
        <Table.Row>
            <Table.Cell textAlign="center" colSpan="2">데이터가 존재하지 않습니다</Table.Cell>
        </Table.Row>;



        return ( 
             <div>
                <Grid container style={{ padding: '7em 0em 0em 0em' }}>
                    <Grid.Row>
                        <Grid.Column>
                            <Header as='h1' dividing>
                            지원현황 상세
                            </Header>
                        </Grid.Column>
                    </Grid.Row>

                    <Grid.Row>
                        <Grid.Column>
                        <Message>
                            <Container>
                                <div style={mainTitle}>{`공고명 : ${recruitInfo.noticeName}`}</div>
                                <div className="margin_top_10" style={subTitle}>{`공고상태 : ${recruitInfo.noticeStatus}`}</div>
                            </Container>
                            <Container className="margin_top_20">
                                <div className="" style={contents}>{`총 지원자 수 : ${summaryInfo.total}명`}</div>
                                <div className="margin_top_5" style={contents}>{`제출완료 수 : ${summaryInfo.complete}명`}</div>
                                <div className="margin_top_5" style={contents}>{`서류합격자 수 : ${summaryInfo.documentPass}명`}</div>
                                <div className="margin_top_5" style={contents}>{`면접합격자 수 : ${summaryInfo.interviewPass}명`}</div>
                                <div className="margin_top_5" style={contents}>{`최종합격자 수 : ${summaryInfo.finalPass}명`}</div>
                            </Container>
                            </Message>
                        </Grid.Column>
                    </Grid.Row>

                    <Grid.Row>
                        <Container>
                            <Header as="h4">{`금일 지원자 수 (${today})`}</Header>
                            <Table celled>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell textAlign="center">지원서 작성 단계</Table.HeaderCell>
                                        <Table.HeaderCell textAlign="center">자기소개서 작성 단계</Table.HeaderCell>
                                        <Table.HeaderCell textAlign="center">회사선택 단계</Table.HeaderCell>
                                        <Table.HeaderCell textAlign="center">제출완료</Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                <Table.Row>
                                        <Table.Cell textAlign="center">{todayInfo.applying}</Table.Cell>
                                        <Table.Cell textAlign="center">{todayInfo.resume}</Table.Cell>
                                        <Table.Cell textAlign="center">{todayInfo.choice}</Table.Cell>
                                        <Table.Cell textAlign="center">{todayInfo.submit}</Table.Cell>
                                    </Table.Row>
                                </Table.Body>

                            </Table>
                        </Container>
                    </Grid.Row>

                    <Grid.Row>
                        <Container>
                            <Header as="h4">회사별 지원현황 (동일한 선택 건수 일 경우, 높은 지망순위가 많은 순 정렬)</Header>
                            <Table compact celled structured padded>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell textAlign="center" rowSpan='2'>회사명</Table.HeaderCell>
                                        <Table.HeaderCell textAlign="center" rowSpan='2'>채용예정인원</Table.HeaderCell>
                                        <Table.HeaderCell textAlign="center" rowSpan='2'>총 선택건수</Table.HeaderCell>
                                        <Table.HeaderCell textAlign="center" colSpan='3'>지망순위별 선택건수</Table.HeaderCell>
                                    </Table.Row>
                                    <Table.Row>
                                        <Table.HeaderCell textAlign="center">1지망</Table.HeaderCell>
                                        <Table.HeaderCell textAlign="center">2지망</Table.HeaderCell>
                                        <Table.HeaderCell textAlign="center">3지망</Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {companyRank.length > 1 ? generateCompanyRankingRow(companyRank) : noCompanyRankingRow}
                                </Table.Body>

                            </Table>
                        </Container>
                    </Grid.Row>

                    <Grid.Row>
                        <Container>
                            <Header as="h4">학교별 지원순위</Header>
                            <Table celled style={{"width":"50%"}}>
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell textAlign="center">학교명</Table.HeaderCell>
                                        <Table.HeaderCell textAlign="center">지원자 수</Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {schoolRank.length > 0 ? generateSchoolRankingRow(schoolRank) : noSchoolRankingRow}
                                </Table.Body>

                            </Table>
                        </Container>
                    </Grid.Row>

                    <Grid.Row>
                        <Container>
                            <Header as="h4">지원자 현황</Header>
                            
                            <ReactTable
                                columns={[
                                    { Header:"아이디", accessor:"applyUserId", style: textCenter, headerStyle:headerClass, width: 160 },
                                    { Header:"성명", accessor:"applyName", style:textCenter, headerStyle:headerClass, width:90 },
                                    { Header:"생년월일", accessor:"applyBirth", style: textCenter, headerStyle:headerClass, width:100,
                                        Cell: (rowInfo) => { 
                                            return <span>{dateBarFormat(rowInfo.value)}</span>
                                        } 
                                    },
                                    { Header:"최종학력", accessor:"applySchool", style:textCenter, headerStyle:headerClass },
                                    { Header:"현재단계", accessor:"applyStatus", style:textCenter, headerStyle:headerClass, width: 110 },
                                    { Header:"지원날짜", accessor:"createDatetime", style:textCenter, headerStyle:headerClass, width:100,
                                        Cell: (rowInfo) => { 
                                            return <span>{rowInfo.value.substring(0,10)}</span>
                                        }
                                    },
                                    { Header:"1지망", accessor:"firstCompany", style:textCenter, headerStyle:headerClass },
                                    { Header:"2지망", accessor:"secondCompany", style:textCenter, headerStyle:headerClass },
                                    { Header:"3지망", accessor:"thirdCompany", style:textCenter, headerStyle:headerClass },
                                    { Header:"", accessor:"", width: 110,  headerStyle:headerClass,
                                        Cell: (row) => (
                                            <a className="btn_table_Grid_gray" onClick={ () => clickApplyDetail(row) }>상세보기<span className="margin_left_5"><img src={iconDetail}/></span></a>
                                        )
                                    },
                                ]}
                                data={applyUserList}
                                defaultPageSize={10}
                                className="-striped -highlight"
                            ></ReactTable>
                        </Container>
                    </Grid.Row>
                    <Grid.Row>
                        <Container textAlign="right">
                            <Button color="blue" size="medium" >
                                <CSVLink data={applyUserList} headers={applyUserListHeader} style={prettyLink}
                                filename="행복성장캠퍼스_지원자현황_list.csv">Excel Download </CSVLink>
                                <img src={iconDownload} />
                            </Button>
                        </Container>
                    </Grid.Row>           
                    <Grid.Row>
                        <Container textAlign="center">
                            <Button color="red" size="large" onClick={clickBack}>
                                <Icon name="redo"/>뒤로가기</Button>
                        </Container>
                    </Grid.Row>
                </Grid>
            </div>
         );
    }
}

export default connect(
    //props로 넣어줄 스토어 상태값
    (state) => ({
        serialNumber: state.recruit.get("serialNumber"),
        recruitInfo: state.recruit.get("recruitInfo")
    })
    //props로 넣어줄 액션 생성함수
    , (dispatch) => ({
        RecruitActions: bindActionCreators(recruitActions, dispatch),
    })
)(RecruitDetailContainer);
 