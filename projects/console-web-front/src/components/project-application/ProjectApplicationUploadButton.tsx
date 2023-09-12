import { InboxOutlined } from '@ant-design/icons';
import { OrganizationId, ProjectId } from '@dogu-private/types';
import { Button, Checkbox, Modal, Upload, UploadFile } from 'antd';
import { RcFile } from 'antd/es/upload';
import { AxiosError } from 'axios';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';
import styled from 'styled-components';

import { uploadProjectApplication } from '../../api/project-application';
import useModal from '../../hooks/useModal';
import useEventStore from '../../stores/events';
import { sendErrorNotification, sendSuccessNotification } from '../../utils/antd';
import { getErrorMessageFromAxios } from '../../utils/error';

interface Props {
  organizationId: OrganizationId;
  projectId: ProjectId;
}

const ProjectApplicationUploadButton = ({ organizationId, projectId }: Props) => {
  const [isOpen, openModal, closeModal] = useModal();
  const [isLatest, setIsLatest] = useState<boolean>(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const fireEvent = useEventStore((state) => state.fireEvent);
  const { t } = useTranslation();

  const handleCloseModal = () => {
    setFileList([]);
    setIsLatest(false);
    closeModal();
  };

  const handleUploadFile = async () => {
    if (fileList.length < 1) {
      return;
    }

    setLoading(true);
    try {
      const file = fileList[0];
      await uploadProjectApplication(organizationId, projectId, file.originFileObj!, isLatest);
      sendSuccessNotification(t('project-app:uploadAppSuccessMessage'));
      fireEvent('onProjectApplicationUploaded');
      handleCloseModal();
    } catch (e) {
      if (e instanceof AxiosError) {
        sendErrorNotification(t('project-app:uploadAppFailureMessage', { reason: getErrorMessageFromAxios(e) }));
      }
    }
    setLoading(false);
  };

  return (
    <>
      <Button onClick={() => openModal()} type="primary" access-id="project-app-upload-btn">
        {t('project-app:uploadAppButtonTitle')}
      </Button>

      <Modal
        open={isOpen}
        closable
        centered
        title={t('project-app:uploadAppModalTitle')}
        onCancel={handleCloseModal}
        onOk={handleUploadFile}
        confirmLoading={loading}
        cancelText={t('common:cancel')}
        okText={t('common:upload')}
        destroyOnClose
        okButtonProps={{ id: 'project-app-upload-modal-ok-btn' }}
      >
        <Upload.Dragger
          id="project-app-uploader"
          accept=".apk, .ipa"
          disabled={loading}
          customRequest={async (option) => {
            const file = option.file as RcFile;
            setFileList([{ name: file.name, status: 'done', uid: file.name, originFileObj: file }]);
          }}
          fileList={fileList}
          multiple={false}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ fontSize: '3rem' }} />
          </p>
          <p className="ant-upload-text">{t('project-app:uploadAppDescriptionText')}</p>
          <StyledHint className="ant-upload-hint">
            <Trans i18nKey="project-app:uploadAppDescriptionHintText" components={{ br: <br />, code: <code /> }} />
          </StyledHint>
        </Upload.Dragger>
        <div style={{ marginTop: '.5rem' }}>
          <Checkbox checked={isLatest} onChange={(e) => setIsLatest(e.target.checked)}>
            {t('project-app:uploadAppLatestCheckboxText')}
          </Checkbox>
        </div>
      </Modal>
    </>
  );
};

export default ProjectApplicationUploadButton;

const StyledHint = styled.p`
  code {
    font-family: monospace;
    font-weight: 600;
    background-color: #f5f5f5;
  }
`;
