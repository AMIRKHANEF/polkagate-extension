// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

interface Props {
  color: string
  height: number;
  width: number;
}

const MakeRecoverableIcon = ({ height, width, color }: Props) => (
  <svg width={width} height={height} viewBox="0 0 59 57" fill="none" xmlns="http://www.w3.org/2000/svg" >
    <path d="M24.3835 0H19.5068C18.2134 0 16.973 0.509372 16.0584 1.41606C15.1439 2.32274 14.6301 3.55247 14.6301 4.83472V14.5042H4.87669C3.58331 14.5042 2.34291 15.0135 1.42835 15.9202C0.513794 16.8269 0 18.0566 0 19.3389V24.1736C0 25.4559 0.513794 26.6856 1.42835 27.5923C2.34291 28.499 3.58331 29.0083 4.87669 29.0083H14.6301V38.6778C14.6301 39.96 15.1439 41.1898 16.0584 42.0964C16.973 43.0031 18.2134 43.5125 19.5068 43.5125H24.3835C25.6768 43.5125 26.9173 43.0031 27.8318 42.0964C28.7464 41.1898 29.2602 39.96 29.2602 38.6778V29.0083H39.0135C40.3069 29.0083 41.5473 28.499 42.4619 27.5923C43.3765 26.6856 43.8902 25.4559 43.8902 24.1736V19.3389C43.8902 18.0566 43.3765 16.8269 42.4619 15.9202C41.5473 15.0135 40.3069 14.5042 39.0135 14.5042H29.2602V4.83472C29.2602 3.55247 28.7464 2.32274 27.8318 1.41606C26.9173 0.509372 25.6768 0 24.3835 0Z" fill={color} />
    <path d="M17.6885 47.0072C18.0418 47.5351 18.4186 48.0492 18.8181 48.5479C21.5026 51.8988 25.1025 54.4135 29.1886 55.7923C33.2747 57.1712 37.6746 57.3559 41.8637 56.3244C46.0528 55.2929 49.8542 53.0888 52.8148 49.9749V51.9016C52.8114 52.1956 52.8726 52.4868 52.994 52.755C53.1154 53.0232 53.2942 53.2621 53.518 53.455C53.7418 53.6479 54.0052 53.7903 54.29 53.8723C54.5748 53.9542 54.8742 53.9738 55.1674 53.9297C55.6636 53.8343 56.1101 53.5685 56.4281 53.179C56.7462 52.7895 56.9155 52.3012 56.9063 51.8002V44.8032C56.9063 44.2653 56.6907 43.7494 56.3071 43.369C55.9234 42.9887 55.4031 42.775 54.8605 42.775H47.7005C47.4039 42.7717 47.1102 42.8323 46.8396 42.9527C46.5691 43.0731 46.3282 43.2504 46.1336 43.4722C45.939 43.6941 45.7954 43.9552 45.7127 44.2376C45.63 44.5199 45.6102 44.8167 45.6547 45.1074C45.7509 45.5994 46.0191 46.042 46.412 46.3573C46.8049 46.6726 47.2973 46.8404 47.8027 46.8313H50.1553C47.7726 49.462 44.6704 51.35 41.2258 52.2659C37.7812 53.1819 34.1424 53.0863 30.7515 51.9908C27.8315 51.0474 25.2037 49.3975 23.1004 47.2H19.5068C18.8907 47.2 18.2815 47.1344 17.6885 47.0072Z" fill={color} />
    <path d="M30.9251 44.2068C32.5024 45.4817 34.1796 46.6307 35.941 47.6428L36.4524 47.8456L36.9639 47.6428C38.9073 46.5273 46.6811 42.0654 46.6811 36.9951V28.0265C46.2743 28.8223 45.7402 29.5571 45.092 30.1997C44.361 30.9244 43.512 31.5051 42.5896 31.9234V36.9951C42.5896 37.1979 42.3851 39.4289 36.4524 43.1809V32.6958H32.9797V38.6778C32.9797 40.7115 32.2464 42.6703 30.9251 44.2068Z" fill={color} />
    <path d="M36.4524 29.0083H29.2602V38.6778C29.2602 39.754 28.8982 40.7933 28.2411 41.6356C27.0597 40.2332 26.2238 38.6578 26.2238 36.9951V27.97L36.4524 23.7109L43.2625 26.5465C43.0467 26.9263 42.7783 27.2786 42.4619 27.5923C41.5473 28.499 40.3069 29.0083 39.0135 29.0083H38.6334L36.4524 28.0714V29.0083Z" fill={color} />
    <path d="M47.6098 20.1764C48.7785 21.0603 49.8422 22.0842 50.7744 23.2301C53.0133 25.9823 54.3978 29.3198 54.7596 32.8372C54.8105 33.3392 55.0483 33.8044 55.4266 34.1419C55.8049 34.4794 56.2965 34.6651 56.8054 34.6625C57.0921 34.6639 57.376 34.6056 57.6385 34.4912C57.9011 34.3769 58.1365 34.2091 58.3294 33.9987C58.5223 33.7883 58.6684 33.5401 58.7583 33.2701C58.8482 33.0002 58.8798 32.7145 58.8511 32.4316C58.2931 26.9269 55.6919 21.8242 51.5525 18.114C49.9058 16.638 48.0625 15.4243 46.0883 14.498C47.0722 15.9113 47.6098 17.5976 47.6098 19.3389V20.1764Z" fill={color} />
    <path d="M29.2602 13.5041V14.5042H39.0135C40.3069 14.5042 41.5473 15.0135 42.4619 15.9202C43.0254 16.4789 43.4367 17.1601 43.6695 17.9007C43.1723 17.6904 42.6646 17.5013 42.1477 17.3343C38.7569 16.2388 35.1181 16.1432 31.6735 17.0591C28.2289 17.975 25.1267 19.8631 22.7439 22.4938H25.0965C25.6019 22.4846 26.0944 22.6525 26.4873 22.9678C26.8802 23.2831 27.1484 23.7257 27.2446 24.2177C27.2891 24.5084 27.2693 24.8051 27.1866 25.0875C27.1039 25.3698 26.9603 25.631 26.7657 25.8528C26.5711 26.0747 26.3302 26.252 26.0596 26.3723C25.7891 26.4927 25.4954 26.5534 25.1988 26.55H18.0388C17.4962 26.55 16.9759 26.3363 16.5922 25.956C16.2086 25.5757 15.993 25.0598 15.993 24.5219V17.5249C15.9838 17.0238 16.1531 16.5356 16.4712 16.146C16.7892 15.7565 17.2356 15.4907 17.7319 15.3953C18.0251 15.3512 18.3245 15.3708 18.6093 15.4528C18.8941 15.5348 19.1575 15.6771 19.3813 15.8701C19.6050 16.0630 19.7838 16.3018 19.9053 16.5701C20.0267 16.8383 20.0879 17.1295 20.0845 17.4235V19.3502C22.1805 17.1309 24.7157 15.3641 27.5316 14.1601C28.0994 13.9174 28.6761 13.6986 29.2602 13.5041Z" fill={color} />
    <path d="M14.6301 35.2635C14.811 35.0824 15.0249 34.9366 15.2607 34.8338C15.5233 34.7195 15.8071 34.6611 16.0939 34.6625C16.6028 34.66 17.0944 34.8456 17.4727 35.1831C17.8510 35.5206 18.0888 35.9858 18.1396 36.4878C18.3946 38.9660 19.1571 41.3548 20.3684 43.5125H19.5068C18.2134 43.5125 16.9730 43.0031 16.0584 42.0964C15.1439 41.1898 14.6301 39.96 14.6301 38.6778V35.2635Z" fill={color} />
  </svg>
);

export default MakeRecoverableIcon;
