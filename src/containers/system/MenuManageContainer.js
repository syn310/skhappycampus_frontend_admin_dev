import React, { Component } from 'react';
import { Header, Grid, Tab, Button } from 'semantic-ui-react'
import { MenuApplicant, MenuBp, MenuPopup } from 'components';
import axios from 'axios';
import storage from 'lib/storage';

class MenuManageContainer extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            bpMenuData:[],
            appMenuData:[],
            openPopup: false,
            menuInfo: {
                menuId:"",
                menuName:"",
                url:"",
                subUrl:"",
                parent:"",
                useYn:"",
                mainShowYn:"N",
                subMenuYn:"N",
                showYn:"Y",
                needLoginYn:"N",
                ord:"",
                mainDescription:""
            },
            activeIndex:0,
            popupType:"",
            menuId:[]
         }
    }

    componentDidMount = () => {
        this.getAppMenuData();
    }

    getMenuId = (activeIndex, menuInfo) => {

        const self = this;

        axios({
          url: (activeIndex == 0 ? "/menuUser" : "/menuBp") + "/menuid",
          method:"get",
          headers: { Pragma: 'no-cache', "x-access-token": storage.getToken() }
        })
        .then( (res) => {
          if (res.data){
            storage.setSessionObj(res.headers);
              //조회한 데이터 store에 셋팅
              self.setState({
                openPopup: true,
                menuInfo,
                popupType:"수정",
                menuId: _.concat([{"text":"선택","value":""}], res.data)
            })
          }
        }).catch(
            (err) => {
            console.log(err);
        });
    }

    getMenuIList = (activeIndex) => {

        const self = this;

        axios({
          url: (activeIndex == 0 ? "/menuUser" : "/menuBp") + "/menuid",
          method:"get",
          headers: { Pragma: 'no-cache', "x-access-token": storage.getToken() }
        })
        .then( (res) => {
          if (res.data){
            storage.setSessionObj(res.headers);
              //조회한 데이터 store에 셋팅
              self.setState({
                menuId: _.concat([{"text":"선택","value":""}], res.data)
            })
          }
        }).catch(
            (err) => {
            console.log(err);
        });
    }   

    getBpMenuData = () => {
        
        const self = this;

        axios({
          url:"/menuBp",
          method:"get",
          headers: { Pragma: 'no-cache', "x-access-token": storage.getToken() }
        })
        .then( (res) => {
          if (res.data) {
                storage.setSessionObj(res.headers);
              //조회한 데이터 store에 셋팅
              self.setState({
                  bpMenuData:res.data
              })
          }
        }).catch(
            (err) => {
            console.log(err);
        });

    }

    getAppMenuData = () => {
        
        const self = this;

        axios({
          url:"/menuUser",
          method:"get",
          headers: { Pragma: 'no-cache', "x-access-token": storage.getToken() }
        })
        .then( (res) => {
          if (res.data){
                storage.setSessionObj(res.headers);
              //조회한 데이터 store에 셋팅
              self.setState({
                  appMenuData:res.data
              })
          }
        }).catch(
            (err) => {
            console.log(err);
        });

    }

    reload = () => {
        this.clickClose();
        this.getAppMenuData();
        this.getBpMenuData();
    }

    saveContent = () => {

        const { menuInfo, popupType, activeIndex } = this.state;
        const self = this;

        if(confirm("저장하시겠습니까?"))
            if(this.checkValidation()){
                if(activeIndex==1){
                    axios({
                        url: popupType==="등록" ? "/menuBp" : `/menuBp/${menuInfo.menuId}`,
                        method : popupType==="등록" ? "post" : "put",
                        data: { menuInfo },
                        headers: { "Pragma" : 'no-cache', "x-access-token": storage.getToken()  }
                    }).then((res)=>{
                        if(res.data){
                            storage.setSessionObj(res.headers);
                            alert("저장되었습니다");
                            self.reload();

                        }
                        // console.log("res", res)
                    }).catch((err)=>{
                        console.log("err", err.response)
                    })
                }
                else {
                    axios({
                        url: popupType==="등록" ? "/menuUser" : `/menuUser/${menuInfo.menuId}`,
                        method : popupType==="등록" ? "post" : "put",
                        data: { menuInfo },
                        headers: { "Pragma" : 'no-cache' , "x-access-token": storage.getToken() }
                    }).then((res)=>{
                        if(res.data){
                            storage.setSessionObj(res.headers);
                            alert("저장되었습니다");
                            self.reload();
                        }
                    }).catch((err)=>{
                        console.log("err", err.response)
                    })                
                }
            }

    }


    checkValidation = () => {

        const { menuInfo } = this.state;

        // console.log(menuInfo)

        if(menuInfo.menuName.length == 0){
            alert("메뉴명은 필수 입력항목입니다");
            return;
        }
        if(menuInfo.url.length == 0){
            alert("URL은 필수 입력항목입니다");
            return;
        }
        if(menuInfo.useYn.length == 0){
            alert("사용여부는 필수 입력항목입니다");
            return;
        }
        if(menuInfo.subMenuYn.length == 0){
            alert("Sub메뉴여부는 필수 입력항목입니다");
            return;
        }
        if(menuInfo.mainShowYn.length == 0){
            alert("메인퀵메뉴여부는 필수 입력항목입니다");
            return;
        }

        if(menuInfo.subMenuYn === "Y"){
            if(!menuInfo.subUrl || menuInfo.subUrl.length == 0){
                alert("Sub메뉴 URL은 필수 입력항목입니다");
                return;
            }
            if(!menuInfo.parent || menuInfo.parent.length == 0){
                alert("상단메뉴ID는 필수 입력항목입니다");
                return;
            }
            if(!menuInfo.ord || menuInfo.ord.length == 0){
                alert("순서는 필수 입력항목입니다");
                return;
            }
        }

        if(menuInfo.mainShowYn === "Y"){
            if(!menuInfo.mainDescription || menuInfo.mainDescription.length == 0){
                alert("메인퀵메뉴 소개는 필수 입력항목입니다");
                return;
            }
        }

        return true;


    }

    clickTitle = (e) => {
        const { activeIndex } = this.state;
        const menuId = e.target.getAttribute("data-menuid");
        const menuData = _.cloneDeep(activeIndex == 0 ? this.state.appMenuData : this.state.bpMenuData);
        
        const menuInfo = _.filter(menuData, function(obj){
            return obj.menuId===menuId}
        )[0];

        this.getMenuId(activeIndex, menuInfo);


    }


    inputChange = (e, data) => {
        let input = this.state.menuInfo;
        input[e.target.name] = e.target.value;
        this.setState({
            menuInfo: input
        })
    }

    radioChange = (e, data) => {
        //console.log(data)
        let input = this.state.menuInfo;
        input[data.name] = data.value;
        this.setState({
            menuInfo: input
        })
    }

    clickNew = () => {

        const { activeIndex } = this.state;
        this.getMenuIList(activeIndex);
        const { menuId } = this.state;
        const nextIdx = activeIndex == 0 ? this.state.appMenuData.length + 1 : this.state.bpMenuData.length + 1;

        this.setState({
            openPopup: true,
            menuInfo: {
                menuId:(activeIndex == 0 ?"A" : "B") + nextIdx,
                menuName:"",
                url:"",
                subUrl:"",
                parent:menuId,
                useYn:"Y",
                showYn:"Y",
                needLoginYn:"N",
                mainShowYn:"N",
                subMenuYn:"N",
                ord:"",
                mainDescription:""
            },
            popupType:"등록"
        })
    }

    clickClose = () => {
        // console.log("click")
        this.setState({
            openPopup: false,
            menuInfo: {
                menuId:"",
                menuName:"",
                url:"",
                subUrl:"",
                parent:"",
                useYn:"",
                mainShowYn:"N",
                subMenuYn:"N",
                ord:"",
                mainDescription:""
            },
            popupType:"",
            menuId:[]
        })
    }


    handleTabChange = (e, { activeIndex }) => {
        //console.log(activeIndex)
        if(activeIndex === 0){
            this.getAppMenuData();
        }else if(activeIndex === 1){
            this.getBpMenuData();
        }
        this.setState({ activeIndex })
    }

    handleSelectChange = (e, {value}) => {
        let input = this.state.menuInfo;
        input["parent"] = value;
        this.setState({
            menuInfo: input
        })
    }


    render() { 

        const { bpMenuData, 
                appMenuData,
                openPopup,
                menuInfo,
                activeIndex,
                popupType,
                menuId } = this.state;

        const { clickTitle,
                clickClose,
                handleTabChange,
                inputChange,
                radioChange,
                saveContent,
                handleSelectChange,
                clickNew } = this;

        return ( 
            <div>

                <MenuPopup 
                    openPopup={openPopup}
                    clickClose={clickClose}
                    menuInfo={menuInfo}
                    tabIndex={activeIndex}
                    inputChange={inputChange}
                    radioChange={radioChange}
                    saveContent={saveContent}
                    popupType={popupType}
                    menuIdList={menuId}
                    handleSelectChange={handleSelectChange}
                    >
                    
                </MenuPopup>

                <Grid container style={{ padding: '7em 0em 0em 0em' }}>
                    <Grid.Row>
                        <Grid.Column>
                            <Header as='h1' dividing>
                            메뉴 관리
                            </Header>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column>
                            <Tab 
                                onTabChange={handleTabChange}
                                activeIndex={activeIndex}
                                panes={[
                                    {
                                        menuItem: '지원자',
                                        render: props => 
                                            <Tab.Pane attacched="false">
                                                <MenuApplicant 
                                                    clickTitle={clickTitle} 
                                                    appMenuData={appMenuData}
                                                    clickNew={clickNew}
                                                ></MenuApplicant>
                                            </Tab.Pane>,
                                    },
                                    {
                                        menuItem: '협력사',
                                        render: props =>  
                                            <Tab.Pane attacched="false">
                                                <MenuBp 
                                                    clickTitle={clickTitle} 
                                                    bpMenuData={bpMenuData}
                                                    clickNew={clickNew}
                                                ></MenuBp>
                                            </Tab.Pane>
                                      },
                                  ]}
                            />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>

            </div>
         );
    }
}
 
export default MenuManageContainer;