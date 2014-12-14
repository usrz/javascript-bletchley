'use strict';

Esquire.define("test/badrandom", [], function() {

  /*
   * Those are the first 512 bytes generated by RC4 when initialized with a
   * Uint8Array full of zeroes... Just make sure we are properly initialized.
   */
  var a4bad = "9a8898ebed25895336ae119ae503cad6dc722b186d2b8acc542c6bc6e835f67deea63748e79f95c7781949a0e2818b62406af10b0025529818ef019998acafbe"
            + "29d359a4920fe766eb738e9745a91830a0a1b5e29691771f86262dbeabd4d5f16a1a92e0f66f241fe8559dfef8643d3ab59266ee52dc4b6b002e21d8406f320f"
            + "445c9a1858fbb7f796fd99d3402c37beaaa71cd3f60c2a31ee7a36ccf9a00e2a2d6b67b544c54f13456054d3b354c9f809119588e74dc92e49c7f4250c5a20a8"
            + "e379063e99ba935d3403216f6df7dbea128e6ad8be800476d311358c6535b348ccd85179401d2b71295ea5f2ac611ce4c239e30da7ae0113cf03ccc49bbce77b"
            + "dad4c44078aa0f2a74166b0137670fb77ca9a8bc5744a53b5d62d966231c626d9508b563fb57bd725a2ff12d41f4e02e70c2b00a000fe05ee63843318084359c"
            + "9ddc34c914a72323e8e710f5c8a66a4396e630fde3e0e38907dc41da4130f2a7e58e40fe31332def5f32895758ada0ba717f11ff00b0e9e5c35aa8ca9c51998f"
            + "79dfcec99afd865ac117d77a363cb270921a46d9c4e93a264e7fb10f063f290ac5ca44bd3d07db7307fdda6d8de007f0943a274ad3f1b57d08f9745418e570c2"
            + "c7cb8fd45f1e02cd6b1b1120f9928358ccb2afb5518f26526657ea505a03aabe96d13940ccbad90fb7bb01c6df9a7f36b8210378b532bd39da32697c8e32d1b3";

  /*
   * Those are the first 1024 bytes generated by SecureRandom when initialized
   * with a Uint8Array full of zeroes... Same as above...
   */
  var srbad = "e75d5e1db2e77c9660d34945eaf5742c1dc3fc1828adc0612e097592c07e75981d6c378571e217ee74a5b7ddbbc9c50922d082116ad4b899fe33345f332a123f"
            + "a885c43449575bc9278f4efaff022df3b29c2776a05176ef5e839a8c8e33c4a181b98da3bc9288261b6aa0b442e15e64dc60356367bb3b348c737dc279ee88b9"
            + "3ee9fe62e95ae822ec0e061806ec1b9a35951e2dda05a8ed588ee134ea5a2ce6d610d1b2b57ba3d0545468d2902c29e3ea7cc26c447017d6b1e80b67dec718c4"
            + "d0ddfd274da80378d44fe3f63725217fc72f22101e563ec8fb742b2fb522540cfe3db94df1556724231c6ed89ac5ddba9a396422846ff9596769e96defeebe72"
            + "5d08fa60ac2125b37ade81ce3533689f934ed4de345c4c33ab181017927c3a1a9a653db68b52e0e90c3ef2f0cb6e61b331bd6fdbd27e44e4786b7da6c8f925dd"
            + "2d306b9a8cad993cdd2fce32e3aac0ef74e266b9cbd744ac0dd7ec12987ce67dcdd8d09c6ff501bb2a562b624d3612bc025c5ece238c0bdfe2ce899f7f62514e"
            + "fb3cf0a839702c8de08549ff889f3db492ae028f21c5add3af182fdb2901a2b4179b51b8c1f7536ac6669e96f3dc1e836ff99f980ade8076b1827e8032a41299"
            + "31bd985605351894440fa1dbcf53fe0be4df7df280d199c805bd16caf8747a27c969ee802ecf38892437943d853c2dadd3cbe3fea3d3542b70b28c097cdcbfa2"
            + "5da0acfeb16bd764dfe0f767c3d98852c89fbb8f7d0a1248192b6d2207a86f01198070774326d0fffa605497780e231439f8c230c00adfbd1665258979bb177b"
            + "920935dedb651338eca728d6c328420b84708e1917fca5248b79f85d3e12bf4defec9393583bdde7122d782c1e51979de96cffa141ae4b24fc25f96c3abc7876"
            + "0c2eb668f3691e2d3d502c4dadda8669fb97b7356b75129c146d7bb44f02c2ffd480d1759155f53bad4a2f261e1430a2bfb029bca95193bb5ff0c5b5f23f4dc5"
            + "93b3938101500d24535e23c18aad2a270c37e058d056f1fc2a7c4ae66291c90b9794eb5378219784cc714ba1766af9218f2c87dc6618cd9a5126750beda5c25e"
            + "13eef42c7f6cf5b1849380ddf1afc46d64bad3c6ae59e2faec053de0e1063676b272a49b7cc7d6d7043ffe7ba1f06ada0f294895a5c302ee5340684f64013070"
            + "632a74fe435ff9d1bcadcd87c4b8d2187b0c8042bc76011f620b6b4afee7ba497d933f2c5c8ff2dd4959a9a23f804c42d6a7226c31922c4563c41ab6ef178fe4"
            + "b73c24761c2e1b9696eed048842d55e4007abbef3742c56282afb286bdfb8f1ada9fd1cd37dd712ebc7dfbc0e79a4fd04e5eed1a1b2b87e9c65e48a1138963ae"
            + "8e77b517454afe9b7618875f029b695fb1dc5ee66eaa91a91b4f64b8650105620661d73d1bbec78b61e895f01748a42edc1dd80096cb3a89cb2cd70f69119b43";

  return { a4bad: a4bad, srbad: srbad };
});
