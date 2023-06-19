import { useState } from 'react';
import ImgCrop from 'antd-img-crop';
import styled from 'styled-components';
import { Progress, Upload } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import { EditOutlined } from '@ant-design/icons';

interface Props {
  profileImage: React.ReactNode;
  progress: number | null;
  onCropEnd: (thumbnail: string) => void;
  onUpload: (file: File) => Promise<void>;
}

const ImageCropUploader = ({ profileImage, progress, onCropEnd, onUpload }: Props) => {
  const { t } = useTranslation();

  return (
    <ProfileImageBox>
      <ImgCrop
        onModalOk={async (file) => {
          const f = file as File;
          const thumbnail = URL.createObjectURL(f);
          onCropEnd(thumbnail);
          await onUpload(f);
        }}
        modalOk={t('common:confirm')}
        modalCancel={t('common:cancel')}
        modalTitle={t('common:imageCropModalTitle')}
      >
        <Upload accept="image/*" fileList={[]} defaultFileList={[]} disabled={progress !== null}>
          <ProfileImageWrapper>
            {profileImage}
            {progress !== null && (
              <ProgressBox>
                <Progress type="circle" percent={progress} width={50} />
              </ProgressBox>
            )}
            <EditImageButton>
              <EditOutlined style={{ fontSize: '.7rem', marginRight: '0.25rem' }} />
              {t('common:edit')}
            </EditImageButton>
          </ProfileImageWrapper>
        </Upload>
      </ImgCrop>
    </ProfileImageBox>
  );
};

export default ImageCropUploader;

const ProfileImageBox = styled.div`
  display: flex;
  margin-bottom: 1rem;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
`;

const ProfileImageWrapper = styled.div`
  position: relative;
  cursor: pointer;
`;

const ProgressBox = styled.div`
  position: absolute;
  top: calc(50% - 25px);
  left: calc(50% - 25px);
  width: 50px;
  height: 50px;
`;

const EditImageButton = styled.button`
  position: absolute;
  bottom: -10px;
  right: -20px;
  display: flex;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  align-items: center;
  font-size: 0.8rem;
  background-color: #fff;
  border: 1px solid ${(props) => props.theme.colors.gray3};
`;
