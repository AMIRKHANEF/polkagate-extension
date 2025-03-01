// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

interface Props {
  color: string
  height: number;
  width: number;
}

const SocialRecoveryIcon = ({ color, height, width }: Props) => (
  <svg width={width} height={height} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_6602_48322)">
      <path d="M10.9989 0.916659C9.62475 0.911198 8.26428 1.18923 7.00249 1.73338C5.7407 2.27753 4.60471 3.07609 3.66553 4.07916V3.20833C3.66703 3.07545 3.63963 2.94384 3.58522 2.82261C3.53081 2.70137 3.45069 2.59342 3.35041 2.50622C3.25014 2.41903 3.13211 2.35468 3.00449 2.31763C2.87688 2.28058 2.74274 2.27172 2.61136 2.29166C2.38899 2.33477 2.18895 2.45491 2.04643 2.63097C1.90392 2.80702 1.82805 3.02769 1.83219 3.25416V6.41666C1.83219 6.65977 1.92877 6.89293 2.10068 7.06484C2.27259 7.23675 2.50574 7.33333 2.74886 7.33333H5.95719C6.09007 7.33483 6.22168 7.30743 6.34291 7.25302C6.46415 7.19861 6.5721 7.11849 6.65929 7.01822C6.74649 6.91794 6.81084 6.79991 6.84789 6.67229C6.88494 6.54468 6.8938 6.41054 6.87386 6.27916C6.83075 6.05679 6.7106 5.85675 6.53455 5.71423C6.3585 5.57172 6.13783 5.49585 5.91136 5.49999H4.85719C5.92488 4.31097 7.31492 3.45763 8.85841 3.04365C10.4019 2.62968 12.0324 2.67288 13.5518 3.16802C15.0712 3.66316 16.4141 4.58892 17.4173 5.83281C18.4205 7.07671 19.0409 8.5852 19.203 10.175C19.2258 10.4019 19.3324 10.6121 19.5019 10.7647C19.6714 10.9172 19.8917 11.0011 20.1197 11C20.2482 11.0006 20.3754 10.9743 20.493 10.9226C20.6107 10.8709 20.7161 10.795 20.8026 10.7C20.889 10.6049 20.9545 10.4927 20.9948 10.3707C21.035 10.2486 21.0492 10.1195 21.0364 9.99166C20.7863 7.50369 19.6207 5.19737 17.7659 3.52041C15.9111 1.84345 13.4994 0.915491 10.9989 0.916659Z" fill={color} />
      <path d="M19.2491 14.6667H16.0408C15.9079 14.6652 15.7763 14.6926 15.6551 14.747C15.5338 14.8014 15.4259 14.8815 15.3387 14.9818C15.2515 15.082 15.1871 15.2001 15.1501 15.3277C15.113 15.4553 15.1042 15.5895 15.1241 15.7208C15.1672 15.9432 15.2874 16.1432 15.4634 16.2858C15.6395 16.4283 15.8602 16.5041 16.0866 16.5H17.1408C16.0731 17.689 14.6831 18.5424 13.1396 18.9563C11.5961 19.3703 9.96559 19.3271 8.4462 18.832C6.9268 18.3368 5.58391 17.4111 4.58068 16.1672C3.57746 14.9233 2.9571 13.4148 2.79496 11.825C2.77216 11.5981 2.66561 11.3878 2.49611 11.2353C2.32661 11.0827 2.10633 10.9989 1.87829 11C1.7498 10.9994 1.6226 11.0257 1.50496 11.0774C1.38732 11.1291 1.28186 11.205 1.19542 11.3C1.10898 11.3951 1.0435 11.5073 1.00323 11.6293C0.962949 11.7513 0.948776 11.8805 0.961627 12.0083C1.15414 13.9328 1.89608 15.7613 3.09896 17.2759C4.30185 18.7904 5.91493 19.927 7.74587 20.5502C9.57681 21.1734 11.5484 21.2569 13.4254 20.7907C15.3025 20.3245 17.0059 19.3283 18.3325 17.9208V18.7917C18.331 18.9245 18.3584 19.0562 18.4128 19.1774C18.4672 19.2986 18.5473 19.4066 18.6476 19.4938C18.7478 19.581 18.8659 19.6453 18.9935 19.6824C19.1211 19.7194 19.2552 19.7283 19.3866 19.7083C19.609 19.6652 19.809 19.5451 19.9516 19.369C20.0941 19.193 20.1699 18.9723 20.1658 18.7458V15.5833C20.1658 15.3402 20.0692 15.1071 19.8973 14.9351C19.7254 14.7632 19.4922 14.6667 19.2491 14.6667Z" fill={color} />
      <path d="M8.29714 15.125C9.06946 15.777 9.89766 16.3598 10.7721 16.8667L11.0013 16.9583L11.2305 16.8667C12.1013 16.3625 15.5846 14.3458 15.5846 12.0542V7.975L11.0013 6.05L6.41797 7.975V12.0542C6.41797 13.2 7.2888 14.2542 8.2513 15.0792H8.29714V15.125ZM11.0013 8.02084L13.7513 9.2125V12.0542C13.7513 12.1458 13.6596 13.1542 11.0013 14.85V8.02084Z" fill={color} />
    </g>
    <defs>
      <clipPath id="clip0_6602_48322">
        <rect width={width} height={height} fill={color} />
      </clipPath>
    </defs>
  </svg>
);

export default SocialRecoveryIcon;
