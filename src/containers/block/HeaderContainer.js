import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import storage from 'lib/storage';
import devtest from 'lib/devtest';
import axios from 'axios';
import * as authActions from 'modules/auth';
import * as menuActions from 'modules/menu';
import logo from 'public/assets/img/logo.png';
import newIcon from 'public/assets/img/icon_new.png';
import {
  Container,
  Dropdown,
  Image,
  Menu,
  Button,
  Icon
} from 'semantic-ui-react'

class HeaderContainer extends Component {
    componentWillMount = () => {
        //렌더링 전에 로그인 체크
        this.handleLoginCheck();
    }

    handleLoginCheck = () => {
        const {AuthActions} = this.props;
        if(storage.isLogin()) {
            const {AuthActions} = this.props;
            AuthActions.login(storage.getSessionObj);
        }else{
            AuthActions.logout();
        }
    }
    
    /** 화면 이동  */
    handleMoveTo = (e) => {
    const clickUrl =  e.currentTarget.getAttribute("data-url");
    this.props.history.push(clickUrl);
    }

    
    componentDidMount = () => {
        // this.handleCheckNewQnaYn();
    }

    /** 1:1문의 답변할 글 여부 체크 */
    handleCheckNewQnaYn = () => {

        const { MenuActions } = this.props;

        axios({
            url:"/qna/checkNewQna",
            method:"get",
            headers: { "Pragma": 'no-cache',
                   "x-access-token": storage.getToken()} //session storage에서 저장된 token을 빼와서 token을 전달.
        })
        .then( (response) => {
            if (response.data){
                storage.setSessionObj(res.headers);
                // let qnaAnswerYn = response.data;

                //조회한 데이터 store에 셋팅
                MenuActions.setQnaStatusMenu(response.data);
                
            }
        }).catch(function(error) {
            console.log(error.response);
        });
    }

    /** 로그아웃 */
    handleLogout = () => {

        const { AuthActions, MenuActions } = this.props;
        const userId = storage.getUserInfo()
        const self = this;
        
        axios({
            url: devtest() + `/login/delete`, 
            method : 'post',
            headers: { "Pragma": 'no-cache' ,"x-access-token": storage.getToken()},
            data : {
                userId: userId
            }
        }).then(
            (res) => {
                if(res.data.length > 0){
                    storage.setSessionObj(res.headers);
                    alert("로그아웃 되었습니다");
                    
                    //sessionStorage에 userInfo key의 데이터 삭제
                    storage.removeSessionObj();

                    //store의 login데이터 reset
                    AuthActions.logout();

                    //로그인 페이지로 이동
                    self.props.history.push("/login");
                }
            }
        ).catch(function(err) {
                //console.log(`err: ${err}`);
        });

    }

    menuClick = (e) => {
        this.props.history.push(e.target.getAttribute("data-url"));
    }


    render() {
        const {handleLogout, handleMoveTo, menuClick} = this;
        const {isLogin, qnaStatusMenu} = this.props;

        let newQnaSubMemu = <span><Image src={newIcon} style={{ marginLeft: '0.3em' , display:'inline-block'}}/></span>;
        let newQnaMainMemu = <span>문의관리<Image src={newIcon} style={{ marginLeft: '0.3em' , display:'inline-block'}}/></span>;

        return (
        <div>
            <Menu fixed='top' borderless>
            <Container >
                <Menu.Item as='a' header data-url="/" onClick={menuClick}>
                    <Image size='small' src={logo} style={{ marginRight: '1.5em' }} data-url="/" onClick={menuClick}/>
                </Menu.Item>
                <Dropdown item text='지원관리'>
                    <Dropdown.Menu>
                        <Dropdown.Item data-url="/applicant/recruit" onClick={menuClick}>모집공고관리</Dropdown.Item>
                        <Dropdown.Item data-url="/notice" onClick={menuClick}>공지사항관리</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                <Dropdown item text={qnaStatusMenu === "N" ? '문의관리': newQnaMainMemu}>
                    <Dropdown.Menu>
                        <Dropdown.Item data-url="/question/faq" onClick={menuClick}>FAQ관리</Dropdown.Item>
                        <Dropdown.Item data-url="/question/qna" onClick={menuClick}>1:1문의답변{qnaStatusMenu === "Y" ? newQnaSubMemu: ""}</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                <Dropdown item text='시스템관리'>
                    <Dropdown.Menu>
                        <Dropdown.Item data-url="/system/user" onClick={menuClick}>사용자관리</Dropdown.Item>
                        <Dropdown.Item data-url="/system/code" onClick={menuClick}>코드관리</Dropdown.Item>
                        <Dropdown.Item data-url="/system/menu" onClick={menuClick}>메뉴관리</Dropdown.Item>
                        {/* <Dropdown.Item>메뉴별권한관리</Dropdown.Item> */}
                        <Dropdown.Item data-url="/system/mail" onClick={menuClick}>메일템플릿관리</Dropdown.Item>
                        {/* <Dropdown.Item>부가정보관리</Dropdown.Item> */}
                        {/* Surim */}
                        <Dropdown.Item data-url="/system/book" onClick={menuClick}>도서나눔관리</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>

                <Menu.Item position='right'>
             
                    {!isLogin && <Button basic size='mini' icon='sign-in' content='로그인' data-url="/login" onClick={handleMoveTo}></Button>}
                    {isLogin && <Button  basic size='mini' icon='sign-out' content='로그아웃' onClick={handleLogout}></Button>}
                </Menu.Item>
                </Container>
            </Menu>
        </div>
        );
    }
}

export default withRouter(connect(
    (state) => ({
        isLogin: state.auth.get('isLogin'),
        clickedMenu: state.menu.get('clickedMenu'),
        qnaStatusMenu: state.menu.get('qnaStatusMenu')
    }), (dispatch) => ({
        AuthActions : bindActionCreators(authActions, dispatch),
        MenuActions : bindActionCreators(menuActions, dispatch)
    })
)(HeaderContainer));
