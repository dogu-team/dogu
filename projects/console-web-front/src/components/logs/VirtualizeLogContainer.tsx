import React from 'react';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import useOnScreen from '../../hooks/useOnScreen';

interface VirtualProps<I> {
  items: I[];
  renderItem: (item: I, index: number) => React.ReactNode;
  keyExtractor: (item: I, index: number) => string;
}

interface BundleProps<I> extends VirtualProps<I> {
  itemsPerBundle: number;
  index: number;
}

const Bundle = <I,>({ items, renderItem, keyExtractor, index, itemsPerBundle }: BundleProps<I>) => {
  const ref = useRef<HTMLDivElement>(null);
  const isRefVisible = useOnScreen(ref);
  const [height, setHeight] = useState(itemsPerBundle * 20);

  useEffect(() => {
    if (ref.current) {
      if (isRefVisible) {
        ref.current.style.height = 'auto';
        setHeight(ref.current.clientHeight);
      } else {
        ref.current.style.height = `${height}px`;
      }
    }
  }, [isRefVisible, height]);

  if (!isRefVisible) {
    return <BundleBox ref={ref} style={{ height: `${height}px` }}></BundleBox>;
  }

  return (
    <BundleBox ref={ref}>
      {items.map((item, i) => (
        <React.Fragment key={keyExtractor(item, index * itemsPerBundle + i)}>
          {renderItem(item, index * itemsPerBundle + i)}
        </React.Fragment>
      ))}
    </BundleBox>
  );
};

interface Props<I> extends VirtualProps<I> {
  itemsPerBundle?: number;
  selectedLine?: number;
  scrollEndOnInit?: boolean;
  scrollEndOnUpdate?: boolean;
  maxHeight?: number;
}

const VirtualizeLogContainer = <I,>({
  items,
  renderItem,
  keyExtractor,
  maxHeight,
  scrollEndOnInit,
  scrollEndOnUpdate,
  itemsPerBundle = 50,
  selectedLine,
}: Props<I>) => {
  const fullBundleCount = Math.trunc(items.length / itemsPerBundle);
  const bundleCount = items.length % itemsPerBundle === 0 ? fullBundleCount : fullBundleCount + 1;
  const bundles = Array.from(Array(bundleCount));
  const ref = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const isRefVisible = useOnScreen(endRef);
  const bundleHeights = useRef<number[]>(bundles.map(() => 0));

  useEffect(() => {
    if (scrollEndOnInit) {
      if (maxHeight) {
        ref.current?.scroll(0, 99999999);
      }
    }
  }, [scrollEndOnInit]);

  useEffect(() => {
    if (isRefVisible && scrollEndOnUpdate) {
      if (maxHeight) {
        ref.current?.scroll(0, 99999999);
      }
    }
  }, [scrollEndOnUpdate, items, isRefVisible]);

  return (
    <Box ref={ref} style={{ height: maxHeight }}>
      {bundles.map((_, i) => (
        <Bundle<I>
          key={`bundle-${i}`}
          items={items.slice(i * itemsPerBundle, i * itemsPerBundle + itemsPerBundle)}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          index={i}
          itemsPerBundle={itemsPerBundle}
        />
      ))}
      <div ref={endRef} style={{ height: '5px' }} />
    </Box>
  );
};

export default VirtualizeLogContainer;

const Box = styled.div`
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
`;

const BundleBox = styled.div`
  width: 100%;
  overflow-x: hidden;
`;
