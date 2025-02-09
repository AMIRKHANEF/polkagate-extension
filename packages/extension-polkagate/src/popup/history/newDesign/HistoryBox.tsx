// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { TransactionDetail } from '@polkadot/extension-polkagate/util/types';

import { Box, Container, type SxProps, type Theme, Typography } from '@mui/material';
import React from 'react';

import { emptyHistoryList } from '../../../assets/icons/index';
import { useChainInfo, useTranslation } from '../../../hooks';
import VelvetBox from '../../../style/VelvetBox';
import HistoryItem from './HistoryItem';

const EmptyHistoryBox = () => {
  const { t } = useTranslation();

  return (
    <>
      <Box
        component='img'
        src={emptyHistoryList as string}
        sx={{ height: 'auto', m: '30px auto 15px', width: '125px' }}
      />
      <Typography color='text.secondary' mb='30px' variant='B-2'>
        {t('No activity recorded yet')}!
      </Typography>
    </>
  );
};

interface Props {
  historyItems: Record<string, TransactionDetail[]> | null | undefined;
  genesisHash: string;
  style?: SxProps<Theme>;
}

function HistoryBox ({ genesisHash, historyItems, style }: Props) {
  const { decimal, token } = useChainInfo(genesisHash);

  return (
    <VelvetBox style={style}>
      <Container disableGutters sx={{ display: 'grid', rowGap: '4px' }}>
        {!historyItems
          ? <EmptyHistoryBox />
          : Object.entries(historyItems).map(([date, items], index) => (
            <HistoryItem
              decimal={decimal ?? 0}
              historyDate={date}
              historyItems={items}
              key={index}
              token={token ?? ''}
            />
          ))
        }
        {/* TODO: one should be in the progress (doesn't designed yet), and one at the end of the HistoryItem list) */}
        <div id='observerObj' style={{ height: '1px' }} />
      </Container>
    </VelvetBox>
  );
}

export default HistoryBox;
