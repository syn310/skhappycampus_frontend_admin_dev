import {
  LoginContainer,
  RegisterContainer,
  RecruitContainer,
  NoticeContainer,
  UserManageContainer,
  CodeContainer,
  RecruitDetailContainer,
  FaqManageContainer,
  QnaManageContainer,
  MenuManageContainer,
  MailTemplateContainer,
  BookManageContainer
} from 'containers';

import { RegistForm } from 'components';

export const privateRoutes = [
  //지원관리
  {
    path: "/applicant/recruit",
    component: RecruitContainer
  },
  //지원상세
  {
    path: "/applicant/detail",
    component: RecruitDetailContainer
  },
  {/** 공지사항 관리 */
    path: "/notice",
    component: NoticeContainer
  },
  {/** 사용자 관리 */
    path: "/system/user",
    component: UserManageContainer
  },
  {/** 코드 관리 */
    path: "/system/code",
    component: CodeContainer
  },
  {/** faq 관리 */
    path: "/question/faq",
    component: FaqManageContainer
  },
  {/** 1:1문의답변 관리 */
    path: "/question/qna",
    component: QnaManageContainer
  },
  {/** 메뉴 관리 */
    path: "/system/menu",
    component: MenuManageContainer
  },

  {/** 메뉴 관리 */
    path: "/system/menu",
    component: MenuManageContainer
  },
  {
    path: "/applicant/applyuser",
    component: RegistForm
  },
  {/** 메일 템플릿 관리 */
    path: "/system/mail",
    component: MailTemplateContainer
  },
  {/** 도서기부 관리 */
    path: "/system/book",
    component: BookManageContainer
  },
];

export const publicRoutes = [
  {/** 로그인 */
    path: "/login",
    component: LoginContainer
  },
  {/** 회원가입 */
    path: "/register",
    component: RegisterContainer
  },
  
];