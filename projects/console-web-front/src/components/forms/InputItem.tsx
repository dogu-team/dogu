import React, { forwardRef, HTMLInputTypeAttribute, Ref } from 'react';
import styled from 'styled-components';
import { Input, InputProps, InputRef } from 'antd';

interface Props extends InputProps {
  desc: string;
  errorMsg?: string | null;
}

const InputItem = forwardRef<HTMLInputElement, Props>(({ desc, errorMsg, ...props }, forwardedRef) => {
  return (
    <div className={props.className}>
      <Desc>{desc}</Desc>
      {props.type === 'password' ? (
        <Input.Password ref={forwardedRef as Ref<InputRef>} required {...props} />
      ) : (
        <Input ref={forwardedRef as Ref<InputRef>} {...props} />
      )}
      {errorMsg && <ErrorComment>{errorMsg}</ErrorComment>}
    </div>
  );
});

InputItem.displayName = 'InputItem';

export default React.memo(InputItem);

const Desc = styled.p`
  margin-bottom: 8px;
`;

const ErrorComment = styled.p`
  margin-top: 8px;
  font-size: 13px;
  color: #ff0000;
`;
