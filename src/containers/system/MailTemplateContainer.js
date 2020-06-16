import React, { Component } from 'react';
import { 
    Header, Grid, Table, Input, Select, Button, Transition, Icon } from 'semantic-ui-react';
import { MailTemplateContentPopup } from 'components';
import axios from 'axios';
import storage from 'lib/storage';

class MailTemplateContainer extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            tempList: [],
            tempOriginList: [],
            tempInfo:{
                templateNumber:"",
                template:""
            },
            popupType: "등록",
            openPopup: false
         }
    }

    componentDidMount = () => {
        this.getMailTemplateList();
    }

    /* 팝업 창 닫기 */
    clickClose = () => {
        this.setState({
            openPopup: false,
            tempInfo:{
                templateNumber:"",
                template:""
            },
            popupType:""
        })
    }

    /* 템플릿 클릭 */
    clickTemplate  = (e) => {
        const templateNumber = e.target.getAttribute("data-templatenumber");
        const template = e.target.getAttribute("data-template");

        this.setState({
            openPopup: true,
            tempInfo:{
                templateNumber: templateNumber,
                template: template
            },
            popupType:"수정"
            
        })
    
    }

    changePopupContent = (e) => {
        let input = this.state.tempInfo;
        input[e.target.name] = e.target.value;

        this.setState({
            tempInfo: input
        })
        
    }


    /* 저장시 validation 체크 */
    checkValidation = () => {

        const { tempInfo } = this.state;

        if(tempInfo.template.length == 0){
            alert("템플릿 내용은 필수 항목입니다.");
            return;
        }

        return true;

    }

    /* 저장 */
    saveContent = () => {

        const { tempInfo, popupType } = this.state; 
        const self = this;

        if(confirm("저장하시겠습니까?"))
            if(this.checkValidation())
                axios({
                    url: popupType==="등록" ? "/mailTemplate" : `/mailTemplate/${tempInfo.templateNumber}`,
                    method : popupType==="등록" ? "post" : "put",
                    data: { tempInfo },
                    headers: { "Pragma" : 'no-cache' , "x-access-token": storage.getToken()}
                }).then((res)=>{
                    if(res.data){
                        storage.setSessionObj(res.headers);
                        alert("저장되었습니다");
                        // self.clickClose();

                        self.setState({
                            openPopup: false,
                            popupType:"",
                            tempInfo:{
                                templateNumber:"",
                                template:""
                            }
                        })

                        self.getMailTemplateList();

                    }
                }).catch((err)=>{
                    console.log("err", err)
                })

    }

    /* 새 메일 템플릿 작성 */
    clickNew = () => {
        const newTemplateNumber = (this.state.tempList.length+1).toString();
        this.setState({
            openPopup: true,
            popupType:"등록",
            tempInfo: {
                templateNumber: newTemplateNumber,
                template:""
            }
        });
    }

    /* 메일 템플릿 삭제 */
    deleteContent = (e, data) => {
        
        const templateNumber = data["data-templatenumber"]; // 2019.07.22 수정필요
        console.log("templateNumber", templateNumber);
        const self = this;

        if(confirm("선택하신 항목을 삭제하시겠습니까?"))
            
            axios({
                url: `/mailTemplate/delete/${templateNumber}`,
                method : "put",
                headers: { "Pragma" : 'no-cache', "x-access-token": storage.getToken() }
            }).then((res)=>{
                if(res.data){
                    storage.setSessionObj(res.headers);
                    alert("삭제되었습니다");

                    self.setState({
                        openPopup: false,
                        popupType:"",
                        tempInfo:{
                            templateNumber:"",
                            template:""
                        }
                    })
                    console.log("res", res)
                    self.getMailTemplateList();

                }
            }).catch((err)=>{
                console.log("err", err)
            })

    }

    /* 메일 템플릿 리스트 조회 */
    getMailTemplateList = () => {
        const self = this;
        // console.log("token", storage.getToken())
        axios({
            url: '/mailTemplate',
            method:"get",
            headers: {  "Pragma": 'no-cache',
                        "x-access-token": storage.getToken() 
                     }
        }).then( (res) => {
            if(res.data){
                //토큰 Refresh
                storage.setSessionObj(res.headers);
                //state 초기화
                self.setState({
                    tempList: res.data,
                    tempOriginList: res.data
                });
            }
        }).catch(function(error) {
            console.log(error);
        });
    }


    render() { 
        const { tempList, openPopup, popupType, tempInfo } = this.state;
        const { clickTemplate, clickClose, changePopupContent, clickNew, saveContent, deleteContent } = this;
        return ( 
            <div>
                <MailTemplateContentPopup
                    openPopup={openPopup} 
                    clickClose={clickClose}
                    tempInfo={tempInfo}
                    changePopupContent={changePopupContent}
                    popupType={popupType}
                    saveContent={saveContent}
                >
                </MailTemplateContentPopup>

                <Grid container style={{ padding: '7em 0em 0em 0em' }}>
                    <Grid.Row>
                        <Grid.Column>
                            <Header as='h1' dividing>
                            메일 템플릿 관리
                            </Header>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                    <Grid.Column>
                            <Table celled fixed singleLine>
                                {/* Header 시작 */}
                                <Table.Header>
                                    <Table.Row>
                                        <Table.HeaderCell textAlign="center" style={{"width":"140px"}}>No.</Table.HeaderCell>
                                        <Table.HeaderCell textAlign="center" >Template</Table.HeaderCell>
                                        <Table.HeaderCell textAlign="center" style={{"width":"140px"}}>삭제</Table.HeaderCell>
                                    </Table.Row>
                                </Table.Header>
                                {/* Header 끝 */}
                                {/* Body 시작 */}
                                <Table.Body>
                                    {tempList.map((object, i) => {
                                        return (
                                        <Table.Row key={i}>
                                                <Table.Cell textAlign="center" >{object.templateNumber}</Table.Cell>
                                                <Table.Cell textAlign="center"> 
                                                    <span className="cell_title"  data-templatenumber={object.templateNumber} data-template={object.template} onClick={clickTemplate}>{object.template}</span>
                                                </Table.Cell>
                                                <Table.Cell textAlign="center" >
                                                    <Button  data-templatenumber={object.templateNumber} icon onClick={deleteContent}><Icon name='trash alternate' /></Button>
                                                </Table.Cell> 
                                        </Table.Row>
                                        );
                                    })}
                                </Table.Body>
                                {/* Body 끝 */}
                                <Table.Footer >
                                    <Table.Row >
                                        <Table.HeaderCell colSpan='3' >
                                            <Button primary floated='right' onClick={clickNew}>추가</Button> {/* onClick={openAddPopup}*/}
                                        </Table.HeaderCell>
                                    </Table.Row>
                                </Table.Footer>
                            
                            </Table>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>

            </div>
         );
    }
}
 
export default MailTemplateContainer;