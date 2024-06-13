// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Divider, Grid, Typography } from '@mui/material';
import React from 'react';

import { Motion, PButton, ShortAddress } from '../../../../components';
import { useToken, useTranslation } from '../../../../hooks';
import { SubTitle, ThroughProxy } from '../../../../partials';
import Explorer from '../../../../popup/history/Explorer';
import FailSuccessIcon from '../../../../popup/history/partials/FailSuccessIcon';
import type { TxInfo } from '../../../../util/types';
import { DelegateInformation } from '..';

interface Props {
  address: string | undefined;
  txInfo: TxInfo;
  delegateInformation: DelegateInformation;
  handleClose: () => void;
  allCategoriesLength: number;
  removedTracksLength?: number | undefined;
  status: 'Delegate' | 'Remove' | 'Modify';
}

export default function Confirmation({ address, allCategoriesLength, delegateInformation, handleClose, txInfo, status, removedTracksLength }: Props): React.ReactElement {
  const { t } = useTranslation();
  const token = useToken(address);

  const chainName = txInfo.chain.name.replace(' Relay Chain', '');
  const fee = txInfo.api.createType('Balance', txInfo.fee);

  const DisplayInfo = ({ caption, showDivider = true, value }: { caption: string, value: string, showDivider?: boolean }) => {
    return (
      <Grid alignItems='center' container direction='column' fontSize='16px' fontWeight={400} justifyContent='center'>
        <Grid container item width='fit-content'>
          <Typography lineHeight='40px' pr='5px'>{caption}</Typography>
          <Typography lineHeight='40px'>{value}</Typography>
        </Grid>
        {showDivider &&
          <Grid alignItems='center' container item justifyContent='center'>
            <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mx: '6px', width: '240px' }} />
          </Grid>}
      </Grid>
    );
  };

  return (
    <Motion>
      <SubTitle label={txInfo.success ? t('Completed') : t('Failed')} style={{ paddingTop: '25px' }} />
      <FailSuccessIcon
        showLabel={false}
        style={{ fontSize: '87px', m: `${txInfo?.failureText ? 15 : 20}px auto`, textAlign: 'center', width: 'fit-content' }}
        success={txInfo.success}
      />
      {txInfo?.failureText &&
        <Typography fontSize='16px' fontWeight={400} m='auto' sx={{ WebkitBoxOrient: 'vertical', WebkitLineClamp: '2', display: '-webkit-box', mb: '15px', overflow: 'hidden', textOverflow: 'ellipsis' }} textAlign='center' width='92%'>
          {txInfo.failureText}
        </Typography>
      }
      {/* <AccountHolderWithProxy address={address} chain={txInfo.chain} showDivider selectedProxyAddress={txInfo.throughProxy?.address} /> */}
      <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', pt: '5px', width: '90%' }}>
        <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
          {status === 'Remove' ? t('Account holder') : t('Delegation from')}:
        </Typography>
        <Typography fontSize='16px' fontWeight={400} lineHeight='23px' maxWidth='45%' overflow='hidden' pl='5px' textOverflow='ellipsis' whiteSpace='nowrap'>
          {txInfo.from.name}
        </Typography>
        <Grid fontSize='16px' fontWeight={400} item lineHeight='22px' pl='5px'>
          <ShortAddress address={txInfo.from.address} inParentheses style={{ fontSize: '16px' }} />
        </Grid>
      </Grid>
      {txInfo.throughProxy &&
        <Grid container m='auto' maxWidth='92%'>
          <ThroughProxy address={txInfo.throughProxy.address} chain={txInfo.chain} />
        </Grid>
      }
      <Grid alignItems='center' container item justifyContent='center' pt='8px'>
        <Divider sx={{ bgcolor: 'secondary.main', height: '2px', width: '240px' }} />
      </Grid>
      {txInfo.to?.name &&
        <>
          <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', pt: '5px', width: '90%' }}>
            <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
              {status === 'Remove' ? t('Remove delegation from') : t('Delegation to')}:
            </Typography>
            <Typography fontSize='16px' fontWeight={400} lineHeight='23px' maxWidth='45%' overflow='hidden' pl='5px' textOverflow='ellipsis' whiteSpace='nowrap'>
              {txInfo.to?.name}
            </Typography>
            <Grid fontSize='16px' fontWeight={400} item lineHeight='22px' pl='5px'>
              <ShortAddress address={txInfo.to?.address} inParentheses style={{ fontSize: '16px' }} />
            </Grid>
          </Grid>
          <Grid alignItems='center' container item justifyContent='center' pt='8px'>
            <Divider sx={{ bgcolor: 'secondary.main', height: '2px', width: '240px' }} />
          </Grid>
        </>
      }
      {status !== 'Remove' && delegateInformation.delegateAmount &&
        <DisplayInfo
          caption={t('Vote value:')}
          value={t(`${delegateInformation.delegateAmount} {{token}}`, { replace: { token } })}
        />
      }
      {status !== 'Remove' && delegateInformation?.delegateConviction === undefined &&
        <DisplayInfo
          caption={t('Vote multiplier:')}
          value={t(`${delegateInformation.delegateConviction === 0 ? 0.1 : delegateInformation.delegateConviction}x`)}
        />
      }
      <DisplayInfo
        caption={t('Number of referenda categories:')}
        value={t(`${status === 'Remove' && removedTracksLength ? removedTracksLength : delegateInformation.delegatedTracks.length} of ${allCategoriesLength}`, { replace: { token } })}
      />
      <DisplayInfo caption={t('Fee:')} value={fee?.toHuman() ?? '00.00'} />
      {txInfo?.txHash &&
        <Grid alignItems='center' container fontSize='16px' fontWeight={400} justifyContent='center' pt='8px'>
          <Grid container item width='fit-content'>
            <Typography pr='5px'>{t('Hash')}:</Typography>
          </Grid>
          <Grid container item width='fit-content'>
            <ShortAddress
              address={txInfo.txHash}
              charsCount={6}
              showCopy
              style={{ fontSize: '16px' }}
            />
          </Grid>
        </Grid>
      }
      {txInfo?.txHash &&
        <Grid container justifyContent='center' pt='5px'>
          <Explorer chainName={chainName} txHash={txInfo?.txHash} />
        </Grid>
      }
      <PButton
        _ml={0}
        _onClick={handleClose}
        _width={90}
        left='5%'
        text={txInfo.success ? t('Done') : t('Close')}
      />
    </Motion>
  );
}
