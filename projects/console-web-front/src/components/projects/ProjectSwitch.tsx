import { CaretDownOutlined, CheckOutlined } from '@ant-design/icons';
import { PageBase, ProjectBase } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import useSWRInfinite from 'swr/infinite';
import { createPortal } from 'react-dom';

import { swrAuthFetcher } from '../../api';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';
import { flexRowBaseStyle, flexRowSpaceBetweenStyle } from '../../styles/box';
import ProfileImage from '../ProfileImage';

interface Props {
  organizationId: OrganizationId;
  onChange: (project: ProjectBase) => void;
  selectedProject?: ProjectBase;
  children?: React.ReactNode;
  hideIcon?: boolean;
}

const ProjectSwitch = ({ organizationId, onChange, children, selectedProject, hideIcon }: Props) => {
  const { data, size, setSize, error, isLoading } = useSWRInfinite<PageBase<ProjectBase>>(
    (page) => `/organizations/${organizationId}/projects?page=${page + 1}`,
    swrAuthFetcher,
    {
      revalidateFirstPage: false,
    },
  );
  const [isOpened, setIsOpened] = useState(false);
  const [top, setTop] = useState(140);
  const container = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const lastRef = useRef<HTMLDivElement>(null);

  const projects = data?.map((page) => page.items).flat();
  const hasFinished = data?.[size - 1]?.totalCount === projects?.length;
  const isLoadingMore = size > 0 && isLoading && !error;

  const entry = useIntersectionObserver(isOpened ? lastRef : null, { root: container.current });
  const visible = entry?.isIntersecting;

  useEffect(() => {
    if (isOpened) {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          container.current &&
          !container.current.contains(e.target as Node) &&
          !buttonRef.current?.contains(e.target as Node)
        ) {
          setIsOpened(false);
        }
      };
      const handleScrollOutside = (e: Event) => {
        if (container.current && !container.current.contains(e.target as Node)) {
          setIsOpened(false);
        }
      };

      window.addEventListener('click', handleClickOutside);
      window.addEventListener('scroll', handleScrollOutside);

      return () => {
        window.removeEventListener('click', handleClickOutside);
        window.removeEventListener('scroll', handleScrollOutside);
      };
    }
  }, [isOpened]);

  useEffect(() => {
    if (!hasFinished && visible) {
      setSize((prev) => prev + 1);
    }
  }, [hasFinished, visible, setSize]);

  return (
    <>
      <Box
        ref={buttonRef}
        onClick={(e) => {
          setIsOpened((prev) => !prev);
          setTop(e.currentTarget.getBoundingClientRect().bottom + 4);
        }}
        isOpened={isOpened}
      >
        {children}
        {!hideIcon && (
          <IconBox isOpened={isOpened}>
            <CaretDownOutlined />
          </IconBox>
        )}
      </Box>
      {isOpened &&
        createPortal(
          <ProjectListCotainer ref={container} style={{ top }}>
            {isLoading && <div>Loading...</div>}
            {error && <div>Error...</div>}
            {projects &&
              projects.map((project) => {
                const selected = selectedProject?.projectId === project.projectId;

                return (
                  <Item
                    key={project.projectId}
                    onClick={() => {
                      if (selected) {
                        setIsOpened(false);
                        return;
                      }

                      onChange(project);
                      setIsOpened(false);
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <ProfileImage
                        name={project.name}
                        profileImageUrl={null}
                        size={28}
                        style={{ fontSize: '.9rem' }}
                        shape="square"
                      />
                      <div style={{ marginLeft: '.5rem' }}>{project.name}</div>
                    </div>
                    {selected && (
                      <div>
                        <CheckOutlined />
                      </div>
                    )}
                  </Item>
                );
              })}

            {isLoadingMore ? <div>Loading...</div> : <div ref={lastRef} style={{ height: '1px' }} />}
          </ProjectListCotainer>,
          document.body,
        )}
    </>
  );
};

export default ProjectSwitch;

const Box = styled.button<{ isOpened: boolean }>`
  position: relative;
  ${flexRowBaseStyle}
  width: 100%;
  height: 100%;
  user-select: none;
  background-color: #fff;
  cursor: pointer !important;

  &:hover {
    background-color: ${(props) => props.theme.colorPrimary}22;
  }
`;

const ProjectListCotainer = styled.div`
  position: fixed;
  left: calc(1rem + 4px);
  width: 220px;
  max-height: 200px;
  padding: 0.5rem;
  border-radius: 0.5rem;
  box-shadow: ${(props) => props.theme.main.shadows.blackLight};
  background-color: #fff;
  z-index: 9999;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 2px;
  }
`;

const Item = styled.button`
  ${flexRowSpaceBetweenStyle}
  width: 100%;
  background-color: #fff;
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;

  &:hover {
    background-color: ${(props) => props.theme.colorPrimary}22;
  }
`;

const IconBox = styled.div<{ isOpened: boolean }>`
  display: flex;
  margin-left: -1rem;
  transition: transform 0.2s ease-in-out;
  transform: rotate(${(props) => (props.isOpened ? '180deg' : '0deg')});
`;
