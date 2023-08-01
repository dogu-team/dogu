import { CaretDownOutlined, CheckOutlined } from '@ant-design/icons';
import { PageBase, ProjectBase } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { has } from 'lodash';
import { RefObject, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import useSWRInfinite from 'swr/infinite';

import { swrAuthFetcher } from '../../api';
import useOnScreen from '../../hooks/useOnScreen';
import { flexRowBaseStyle, flexRowSpaceBetweenStyle } from '../../styles/box';
import ProfileImage from '../ProfileImage';

interface Props {
  organizationId: OrganizationId;
  onChange: (project: ProjectBase) => void;
  selectedProject?: ProjectBase;
  children?: React.ReactNode;
}

export function useIntersectionObserver(
  elementRef: RefObject<Element> | null,
  { threshold = 0, root = null, rootMargin = '0%' }: IntersectionObserverInit,
): IntersectionObserverEntry | undefined {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();

  const frozen = entry?.isIntersecting;

  const updateEntry = ([entry]: IntersectionObserverEntry[]): void => {
    setEntry(entry);
  };

  useEffect(() => {
    const node = elementRef?.current; // DOM Ref
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || frozen || !node) return;

    const observerParams = { threshold, root, rootMargin };
    const observer = new IntersectionObserver(updateEntry, observerParams);

    observer.observe(node);

    return () => observer.disconnect();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elementRef?.current, JSON.stringify(threshold), root, rootMargin, frozen]);

  return entry;
}

const ProjectSwitch = ({ organizationId, onChange, children, selectedProject }: Props) => {
  const { data, size, setSize, error, isLoading } = useSWRInfinite<PageBase<ProjectBase>>((page) => `/organizations/${organizationId}/projects?page=${page + 1}`, swrAuthFetcher, {
    revalidateFirstPage: false,
  });
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
        if (container.current && !container.current.contains(e.target as Node) && !buttonRef.current?.contains(e.target as Node)) {
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
          setTop(e.currentTarget.getBoundingClientRect().bottom);
        }}
        isOpened={isOpened}
      >
        {children}
        <IconBox isOpened={isOpened}>
          <CaretDownOutlined />
        </IconBox>
      </Box>
      {isOpened && (
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
                    <ProfileImage name={project.name} profileImageUrl={null} size={28} style={{ fontSize: '.9rem' }} shape="square" />
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
        </ProjectListCotainer>
      )}
    </>
  );
};

export default ProjectSwitch;

const Box = styled.button<{ isOpened: boolean }>`
  position: relative;
  ${flexRowBaseStyle}
  cursor: pointer !important;
  user-select: none;
  background-color: #fff;
`;

const ProjectListCotainer = styled.div`
  position: fixed;
  left: calc(1rem + 4px);
  width: 220px;
  max-height: 250px;
  padding: 0.5rem;
  border-radius: 0.5rem;
  box-shadow: ${(props) => props.theme.main.shadows.blackLight};
  background-color: #fff;
  z-index: 100;
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
  padding: 0 0.5rem;

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
