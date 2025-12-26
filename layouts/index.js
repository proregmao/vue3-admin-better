/**
 * @description Vue Admin Better 项目配置
 */

const webpackBarName = 'vue-admin-better'
const webpackBanner =
  ' build: vue-admin-better \n time: '

/**
 * @description 在控制台打印项目信息
 */
function donationConsole() {
  const chalk = require('chalk')
  console.log(chalk.green(`> 欢迎使用vue-admin-better`))
}

module.exports = {
  webpackBarName,
  webpackBanner,
  donationConsole,
}
