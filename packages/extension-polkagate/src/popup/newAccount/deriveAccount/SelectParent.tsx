// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { canDerive } from '@polkadot/extension-base/utils';

import { AccountContext, ActionContext, Address, ChainLogo, Label, Password, PButton, Warning } from '../../../components';
import useTranslation from '../../../hooks/useTranslation';
import { validateAccount, validateDerivationPath } from '../../../messaging';
import { nextDerivationPath } from '../../../util/nextDerivationPath';
import AddressDropdown from './AddressDropdown';
import DerivationPath from './DerivationPath';

interface Props {
  className?: string;
  isLocked?: boolean;
  parentAddress: string;
  parentName: string | null;
  parentGenesis: string | undefined;
  onDerivationConfirmed: (derivation: { account: { address: string; suri: string }; parentPassword: string }) => void;
}

// match any single slash
const singleSlashRegex = /([^/]|^)\/([^/]|$)/;

export default function SelectParent({ className, isLocked, onDerivationConfirmed, parentAddress, parentGenesis, parentName }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const [isBusy, setIsBusy] = useState(false);
  const { accounts, hierarchy } = useContext(AccountContext);

  const defaultPath = useMemo(() => nextDerivationPath(accounts, parentAddress), [accounts, parentAddress]);

  const [suriPath, setSuriPath] = useState<string | null>();
  const [parentPassword, setParentPassword] = useState<string>('');
  const [isProperParentPassword, setIsProperParentPassword] = useState(false);
  const [pathError, setPathError] = useState('');
  const passwordInputRef = useRef<HTMLDivElement>(null);

  const allowSoftDerivation = useMemo(() => {
    const parent = accounts.find(({ address }) => address === parentAddress);

    return parent?.type === 'sr25519';
  }, [accounts, parentAddress]);
  const theme = useTheme();

  // reset the password field if the parent address changes
  useEffect(() => {
    setParentPassword('');
  }, [parentAddress]);

  useEffect(() => {
    // forbid the use of password since Keyring ignores it
    if (suriPath?.includes('///')) {
      setPathError(t('`///password` not supported for derivation'));
    }

    if (!allowSoftDerivation && suriPath && singleSlashRegex.test(suriPath)) {
      setPathError(t('Soft derivation is only allowed for sr25519 accounts'));
    }
  }, [allowSoftDerivation, suriPath, t]);

  const allAddresses = useMemo(
    () => hierarchy
      .filter(({ isExternal }) => !isExternal)
      .filter(({ type }) => canDerive(type))
      .map(({ address, genesisHash, name }): [string, string | null, string | undefined] => [address, genesisHash || null, name]),
    [hierarchy]
  );

  const onParentPasswordEnter = useCallback(
    (parentPassword: string): void => {
      setParentPassword(parentPassword);
      setIsProperParentPassword(!!parentPassword);
    },
    []
  );

  const onSuriPathChange = useCallback(
    (path: string): void => {
      setSuriPath(path);
      setPathError('');
    },
    []
  );

  const onParentChange = useCallback(
    (address: string) => onAction(`/derive/${address}`),
    [onAction]
  );

  const onSubmit = useCallback(async (): Promise<void> => {
    const _path = suriPath || defaultPath;

    if (_path && parentAddress && parentPassword) {
      setIsBusy(true);

      const isUnlockable = await validateAccount(parentAddress, parentPassword);

      if (isUnlockable) {
        try {
          const account = await validateDerivationPath(parentAddress, _path, parentPassword);

          onDerivationConfirmed({ account, parentPassword });
        } catch (error) {
          setIsBusy(false);
          setPathError(t('Invalid derivation path'));
          console.error(error);
        }
      } else {
        setIsBusy(false);
        setIsProperParentPassword(false);
      }
    }
  },
    [suriPath, defaultPath, parentAddress, parentPassword, onDerivationConfirmed, t]
  );

  useEffect(() => {
    setParentPassword('');
    setIsProperParentPassword(false);

    passwordInputRef.current?.querySelector('input')?.focus();
  }, [onParentPasswordEnter]);

  return (
    <>
      <div className={className}>
        {isLocked
          ? (
            <Grid alignItems='center' container item justifyContent='space-around' sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', m: 'auto', mb: '20px', position: 'relative', width: '92%' }}>
              <Grid item maxWidth='275px' width='275px'>
                <Address
                  address={parentAddress}
                  className='address'
                  genesisHash={parentGenesis}
                  name={parentName}
                  showCopy={false}
                  style={{ border: 'none', borderRadius: 0, m: 0, pl: '5px', px: 0, width: '100%' }}
                />
              </Grid>
              <Grid item width='30px'>
                <ChainLogo genesisHash={parentGenesis} />
              </Grid>
            </Grid>
          )
          : (
            <Label
              label={t('Choose parent account')}
              style={{ margin: 'auto', paddingBottom: '20px', width: '92%' }}
            >
              <AddressDropdown
                allAddresses={allAddresses}
                onSelect={onParentChange}
                selectedAddress={parentAddress}
                selectedGenesis={parentGenesis}
                selectedName={parentName}
              />
            </Label>
          )
        }
        <div
          ref={passwordInputRef}
          style={{ margin: 'auto', width: '92%' }}
        >
          <Password
            data-input-password
            isError={!!parentPassword && !isProperParentPassword}
            isFocused
            label={t('Password for the account to derive from')}
            onChange={onParentPasswordEnter}
            value={parentPassword}
          />
          {!!parentPassword && !isProperParentPassword && (
            <Warning
              isBelowInput
              isDanger
              theme={theme}
            >
              {t('Wrong password')}
            </Warning>
          )}
          <DerivationPath
            defaultPath={defaultPath}
            isError={!!pathError}
            onChange={onSuriPathChange}
            withSoftPath={allowSoftDerivation}
          />
          {(!!pathError) && (
            <Warning
              isBelowInput
              isDanger
              theme={theme}
            >
              {pathError}
            </Warning>
          )}
        </div>
      </div>
      <PButton
        _isBusy={isBusy}
        _onClick={onSubmit}
        disabled={!isProperParentPassword || !!pathError}
        text={t('Next')}
      />
    </>
  );
}
