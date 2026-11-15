import type {HTMLAttributes,RefObject} from 'react'
interface Props extends HTMLAttributes<HTMLFormElement>{onClickSubmit?:(content:string)=>void;onClickCancel?:()=>void;textareaRef?:RefObject<HTMLTextAreaElement|null>;defaultValue?:string;rows?:number}
export default function SingleCommentForm(_props:Props){return <p className="kr-message my-4">댓글 작성은 내부망에 정식 서비스 오픈 후 이용가능</p>}
