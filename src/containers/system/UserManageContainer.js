import React, { Component } from 'react';
import axios from  'axios';
import { connect } from 'react-redux';
import storage from 'lib/storage';
import devtest from 'lib/devtest';
import { 
    Header, Grid, Tab, Container, Input, Button, Icon, Label} from 'semantic-ui-react';
import {UserApplicant, UserBp} from 'components';

class  UserManageContainer extends Component {

    /** 생성자 */
    constructor(props) {
        super(props);
        this.state = {
            code : {
                userType : []
            },
            userOriginList: [],
            userList: [],
            bpList: [],
            bpOriginList: [],
            searchInput: "",
            currentTabIdx: 0,
            bpPermissionCode: [],
        };
    }

    componentDidMount() {
        //지원자 조회
        this.handleGetApplicantList();
        //코드 조회
        this.getCodeValue();
    }

    /** 질문카테고리 코드데이터 조회 */
    getCodeValue = () => {
        axios({
            url:`/commonCode/BP_PERMISSION/K`,//코드 URL은 뒤에 주소 대문자 사용함
            method : 'get',
            headers: { Pragma: 'no-cache'}
        }).then(
            (res)=>{
                if(res.data){
                    // console.log("code", res.data)
                    this.setState({
                        bpPermissionCode: res.data
                    })
                }
            }
        ).catch(
            (err)=>{ if(err) console.log("코드 get err", err.response); }
        )

    }

    /** 지원자 조회 */
    handleGetApplicantList = () => {
        const self = this;
        axios({
            url: devtest() +`/user`, 
            method:"get",
            headers: {  "Pragma": 'no-cache',
                        "x-access-token": storage.getToken() 
                     }
        }).then( (res) => {
            if(res.data){
                storage.setSessionObj(res.headers);
                self.setState({
                    userList: JSON.parse(JSON.stringify( res.data )),
                    userOriginList: JSON.parse(JSON.stringify( res.data )),
                });
            }
        }).catch(function(error) {
            console.log(error);
        });
    }

    /** 지원자 탈퇴 처리 */
    onCancleAccountApplicant = (e) => {
        const self = this;
        const {handleGetApplicantList} = this;
        const userId = e.currentTarget.getAttribute('data-user');
        if(confirm("탈퇴시 지원자의 모든 정보가 삭제됩니다. 삭제하시겠습니까?")){
            axios({
                url: devtest() +`/user/${userId}`,
                method:"delete",
                headers: {  "Pragma": 'no-cache',
                            "x-access-token": storage.getToken() 
                         }
            }).then( (res) => {
                if(res.data){
                    storage.setSessionObj(res.headers);
                    alert('탈퇴처리 되었습니다.')
                    //재조회
                    handleGetApplicantList();
                    
                }
            }).catch(function(error) {
                console.log(error);
            });
        }
    }

    /** 협력사 조회 */
    handleGetBpList = () => {
        const self = this;
        axios({
            url: devtest() +`/bpUser`,
            method:"get",
            headers: {  "Pragma": 'no-cache',
                        "x-access-token": storage.getToken() 
                     }
        }).then( (res) => {
            if(res.data){
                storage.setSessionObj(res.headers);
                self.setState({
                    bpList: JSON.parse(JSON.stringify( res.data )),
                    bpOriginList: JSON.parse(JSON.stringify( res.data )),
                });
            }
        }).catch(function(error) {
            console.log(error);
        });
    }

    /** Tab Change event */
    handleTabChange = (e, data) => {
        this.setState({
            currentTabIdx: data.activeIndex
        });
        if(data.activeIndex === 0){
            this.handleGetApplicantList();
        }else if(data.activeIndex === 1){
            this.handleGetBpList();
        }
    }
    
    onButtonChange = (e) => {
        let { bpList } = this.state;
        const userId = e.currentTarget.getAttribute('data-userid'); 
        for (const [index, object] of bpList.entries()) {
            if (object.userId === userId ) {                
                object[e.target.name] = e.target.value;
            }
        }
        this.setState({
            bpList: bpList
        });
    }

    /** Semantic UI Select onChange  */
    onSelectChange = (e, data) => {
        let { bpList } = this.state;
        const key = e.currentTarget.parentElement.parentElement.getAttribute('data-userid');

        for (const [index, object] of bpList.entries()) {
            if (object.userId === key ) {
                object[data.name] = data.value;
            }
        }
        this.setState({
            bpList: bpList
        });
    };

    /** 협력사 변경사항 저장 */
    onSave = (e) => {
        const { bpList, bpOriginList } = this.state;
        const {handleGetBpList} = this;
        const differenceList = _.differenceBy(bpList, bpOriginList);

        for( const object of differenceList ){
            
            if(object.aprvCompleteYn ==='' || object.managerYn ==='' ){
                alert('필수 항목을 모두 입력하시기 바랍니다.');
                return;
            }
            if(object.aprvCompleteYn ==='N' && object.managerYn ==='Y'){
                alert(`${object.userId}를 대표 관리자로 선정하려면 가입 승인을 선택하시기 바랍니다.`);
                return;
            }
        }
      
        axios({
            url: devtest() +`/bpUser`,
            method:"put",
            data: {
                bpList: differenceList
            },
            headers: {  "Pragma": 'no-cache',
                        "x-access-token": storage.getToken() 
                        }
        }).then( (res) => {
            if(res.data){
                storage.setSessionObj(res.headers);
                alert("저장되었습니다");
                handleGetBpList();
            }
        }).catch(function(error) {
            console.log(error);
        });
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
    clickSearch = (e,data) => {
        const { userOriginList, bpOriginList, searchInput, currentTabIdx } = this.state;
            if(searchInput.length > 0){
                if(currentTabIdx === 0){
                    this.setState({
                        userList: _.filter(userOriginList, function(obj){
                                    return obj.userId.indexOf(searchInput) > -1}
                                    )
                    })
                }else {
                    this.setState({
                        bpList: _.filter(bpOriginList, function(obj){
                                    return obj.userId.indexOf(searchInput) > -1}
                                    )
                    })
                }
            }else{
                if(currentTabIdx === 0){
                    this.setState({
                        userList: userOriginList
                    })
                }else{
                    this.setState({
                        bpList: bpOriginList
                    })
                }
            }
    }
    /** BP사 회원 탈퇴처리 */
    onCancleAccountBp = (e) => {
        const {handleGetBpList} = this;
        const key = e.currentTarget.getAttribute('data-userid');
        if(confirm("탈퇴시 해당 협력사의 모든 정보가 삭제됩니다. 삭제하시겠습니까?")){
            axios({
                url: devtest() +`/bpUser/${key}`,
                method:"delete",
                headers: {  "Pragma": 'no-cache',
                            "x-access-token": storage.getToken() 
                            }
            }).then( (res) => {
                if(res.data){
                    alert("탈퇴되었습니다");
                    storage.setSessionObj(res.headers);
                    handleGetBpList();
                }
            }).catch(function(error) {
                console.log(error);
            });
        }
    }

    render() {
        const { userList, bpList, searchInput, bpPermissionCode} = this.state;
        const { onCancleAccountApplicant
            , handleTabChange 
            , onButtonChange 
            , onSave
            , onSelectChange
            , onCancleAccountBp
            , changeInput
            , pressEnterKey
            , clickSearch} = this;
        return (
            <div>
                <Grid container style={{ padding: '7em 0em 0em 0em' }}>
                    <Grid.Row>
                        <Grid.Column>
                            <Header as='h1' dividing>
                            사용자 관리
                            </Header>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column>
                            <Tab 
                                id="userTable"
                                panes={[
                                    {
                                        menuItem: '지원자',
                                        render: props => 
                                            <Tab.Pane attacched="false">
                                                <Container textAlign='right' >
                                                    <span style={{"float":"left"}} > 총 {userList.length} 명
                                                    </span>
                                                    <div style={{"display":"inline-block"}}>
                                                        <Input placeholder="아이디 검색" 
                                                            value={searchInput} 
                                                            onChange={changeInput} 
                                                            onKeyPress={pressEnterKey}
                                                            className='margin_right_5'
                                                        ></Input>
                                                        <Button icon>
                                                            <Icon name='search' onClick={clickSearch}/>
                                                        </Button>
                                                    </div>
                                                </Container>
                                                <UserApplicant userList={userList} onCancelAccount={onCancleAccountApplicant}></UserApplicant>
                                            </Tab.Pane>,
                                    },
                                    {
                                        menuItem: '협력사',
                                        render: props => 
                                            <Tab.Pane attacched="false">
                                                <Container textAlign='right' >
                                                    <span style={{"float":"left"}} > 총 {bpList.length} 명
                                                    </span>
                                                    <div style={{"display":"inline-block"}}>
                                                        <Input placeholder="아이디 검색" 
                                                            value={searchInput}
                                                            onChange={changeInput}
                                                            onKeyPress={pressEnterKey}
                                                            className='margin_right_5'
                                                        ></Input>
                                                        <Button icon>
                                                            <Icon name='search' onClick={clickSearch}/>
                                                        </Button>
                                                    </div>
                                                </Container>
                                                <UserBp bpList={bpList} 
                                                    onButtonChange={onButtonChange}
                                                    onSelectChange={onSelectChange}
                                                    onSave={onSave}
                                                    onCancelAccount={onCancleAccountBp}
                                                    bpPermissionCode={bpPermissionCode}
                                                ></UserBp>
                                            </Tab.Pane>
                                      },
                                  ]}
                                onTabChange={handleTabChange}
                            />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            
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
    })
)(UserManageContainer);
