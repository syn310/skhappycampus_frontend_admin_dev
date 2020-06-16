
import React, { Component } from 'react';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux'; 
import "react-datepicker/dist/react-datepicker.css";
import { bindActionCreators } from 'redux';
import axios from 'axios';
import storage from 'lib/storage';
import devtest from 'lib/devtest';
import * as recruitActions from 'modules/recruit';

import {
    Container,
    Dropdown,
    Image,
    Menu,Form,
    Button,Grid,Header,
    Icon,
    TextArea
  } from 'semantic-ui-react'

import { RegistBasicInfo, 
        RegistDegreeInfo,
        RegistExtraCert } from 'components';

class RegistForm extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            //stepIndex: "3",
            serialNumber:"",
            //////////////////////////////
            savedYn: false,
            addressSearchPopup: false,
            code:{
                nationalityCode:[],
                degreeCode: [],
                graduStatusCode: []

            },
            basicInfo: { //지원자 기본정보
                serialNumber:"",
                applyUserId:"",
                applyName:"",
                applyNationality:"대한민국",
                applyBirth:"",
                applyGender:"",
                applyPhone:"",
                applyAddress:"",
                //applyAddressDetail:"",
                applyStatus:"3",
                disabilityYn:"",
                militaryYn:"",
                veteransYn:""
            },
            degreeInfoArr : [ //지원자 학력정보 고등학교는 필수
                    {
                        serialNumber:"",
                        applyUserId:"",
                        educationSeq:"1",
                        degree:"",
                        graduStatus:"",
                        enterDateInfo:"",
                        graduDateInfo:"",
                        schoolName:"",
                        major:"",
                        minor:"",
                        doubleMajor:"",
                        grade:"",
                        perfectGrade:"",
                        transferYn1:"아니오",
                        mainCampusYn1:"본교"
                    }
                    
            ], 

            extraCertArr: [] //지원자 추가 자격정보 (선택사항)
        }
    }



    componentDidMount = (e) => {
        window.scrollTo(0, 0);
        this.getApplyContent();

    }

    getApplyContent = () => {
        this.getBasicInfo(); //기본정보
        //this.getDegreeInfoArr(); //학력정보
        //this.getExtraCertArr(); //추가자격증정보
    }


    //기본정보 가져오기
    getBasicInfo = () => {
        
        const self = this;
        const { serialNumber, applyUserId } = this.props;
        axios({
            url: devtest() +  `/apply/${serialNumber}/${applyUserId}`,
            method : 'get',
            headers: {  "Pragma": 'no-cache',
                        "x-access-token": storage.getToken() 
                    }
        }).then(
            (res)=>{
                if(res.data){
                    storage.setSessionObj(res.headers);
                    let phoneNumber = res.data.applyPhone; 
                    res.data["applyPhone"] = phoneNumber.length == 0 ? "" : phoneNumber.substring(0, 3) + "-" + phoneNumber.substring(3, 7) + "-" + phoneNumber.substring(7, 11);
                    // console.log(res.data)
                    self.setState({
                        basicInfo: res.data
                    })
                    self.getDegreeInfoArr(res.headers);

                }
                
            }
        )
        .catch((err)=>{
            //공통에러처리
        })

    }

    //학력정보 가져오기
    getDegreeInfoArr = (header) => {

        const { basicInfo } = this.state; 
        const self = this;
        const { serialNumber, applyUserId } = this.props;
        // console.log(serialNumber, applyUserId)
        axios({
            url: devtest() +  `/applyEducation/${serialNumber}/${applyUserId}`, 
            method : 'get',
            headers: {  "Pragma": 'no-cache',
                        "x-access-token":  header.newtoken 
                        // "x-access-token": storage.getToken() 
                     }
        }).then(
            (res)=>{
                if(res.data){

                    if(res.data.length == 0){

                        const degreeInfoArr = [ //지원자 학력정보 고등학교는 필수 -> 무조건 넣는다
                                            {
                                                serialNumber: basicInfo.serialNumber,
                                                applyUserId: basicInfo.applyUserId,
                                                educationSeq:"1",
                                                degree:"고등학교",
                                                graduStatus:"졸업",
                                                enterDateInfo:"",
                                                graduDateInfo:"",
                                                schoolName:"",
                                                major:"",
                                                minor:"",
                                                doubleMajor:"",
                                                grade:"",
                                                perfectGrade:"",
                                                transferYn1:"아니오",
                                                mainCampusYn1:"본교",
                                            }
                                ];

                        // ApplyActions.setDegreeInfo(degreeInfoArr);
                        this.setState({
                            degreeInfoArr
                        })
                    }else{

                        //본교/캠퍼스 , 편입여부 radio name과 state의 mainCampusYn, transferYn을 동일형태로 넣어주기 위함.
                        let degreeAfter = []; //_.cloneDeep(res.data);
                        res.data.forEach((obj,idx) => {
                            const transferVal = obj.transferYn;
                            const mainCampusVal = obj.mainCampusYn;
                            obj[`transferYn${obj.educationSeq}`] = transferVal;
                            obj[`mainCampusYn${obj.educationSeq}`] = mainCampusVal;
                            degreeAfter.push(obj)
                        })

                        //위 작업을 지나면 degreeInfo에는 transferYn 과 transterYn${educationSeq} 형태의 두가지가
                        //존재하게됨. 하지만 실제로 사용하는 애는 후자이므로. 아래 validation에서 transferYn는 빼고체크함
                        
                        // ApplyActions.setDegreeInfo(degreeAfter);
                        this.setState({
                            degreeInfoArr: degreeAfter
                        })
                    }
                    self.getExtraCertArr(res.headers); //추가자격증정보

                }

            }
        ).catch((err)=>{
            //공통에러처리
        })


    }

    //자격증정보 가져오기
    getExtraCertArr = (header) => {

        // const { basicInfo } = this.state; 
        const self = this;
        const { serialNumber, applyUserId } = this.props;

        axios({
            url:devtest() +  `/applyCertificate/${serialNumber}/${applyUserId}`, 
            method : 'get',
            headers: {  "Pragma": 'no-cache',
                        "x-access-token": header.newtoken 
                    }
        }).then(
            (res)=>{
                if(res.data){
                    storage.setSessionObj(res.headers);
                    this.setState({
                        extraCertArr: res.data
                    })

                }

            }
        )
        .catch((err)=>{
            //공통에러처리
        })

    }


    clickBack = () => {
        this.props.history.push("/applicant/detail");
    }
 

    render() { 

        const { basicInfo,
                degreeInfoArr,
                extraCertArr } = this.state;

        const { clickBack } = this;

        return ( 

            <Grid container style={{ padding: '7em 0em 0em 0em' }}>
                <Grid.Row>
                    <Grid.Column>
                        <Header as='h1' dividing>
                        지원자상세
                        </Header>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                    <Grid.Column>
                        <Header as='h3'>개인정보</Header>
                        <RegistBasicInfo basicInfo={basicInfo} />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column>
                        <Header as='h3'>학력사항</Header>
                        <RegistDegreeInfo degreeInfoArr={degreeInfoArr} />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column>
                        <Header as='h3'>자격증(선택)</Header>
                        <RegistExtraCert extraCertArr={extraCertArr} />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column>
                        <Header as='h3'>자기소개서</Header>
                        <Form>
                            <TextArea style={{"resize":"none", "backgroundColor":"#f5f5f5"}} disabled value={basicInfo.coverLetter}>
                            </TextArea>
                        </Form>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Container textAlign="center">
                        <Button color="red" size="large" onClick={clickBack}>
                            <Icon name="redo"/>뒤로가기</Button>
                    </Container>
                </Grid.Row>
            </Grid>
            


         );
    }
}

// 컴포넌트에 리덕스 스토어를 연동해줄 때에는 connect 함수 사용
export default connect(
    //props로 넣어줄 스토어 상태값
    
    (state) => ({
        serialNumber: state.recruit.get("serialNumber"),
        applyUserId: state.recruit.get("applyUserId"),
        
    })
    //props로 넣어줄 액션 생성함수
    , (dispatch) => ({
        RecruitActions: bindActionCreators(recruitActions, dispatch)
    })
)(RegistForm);

