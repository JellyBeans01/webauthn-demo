import chalk from "chalk";
import "server-only";

class Logger {
    info(...messages: unknown[]) {
        console.info(this.formatTimestamp(), chalk.bgCyanBright(chalk.black(" INFO ")), ...messages);
    }

    success(...messages: unknown[]) {
        console.log(this.formatTimestamp(), chalk.bgGreen(chalk.black(" SUCCESS ")), ...messages);
    }

    warn(message: string, ...messages: unknown[]) {
        console.warn(this.formatTimestamp(), chalk.bgYellow(chalk.black(" WARN ")), chalk.yellow(message));
        console.warn(...messages);
    }

    error(message: string, error: unknown) {
        console.error(this.formatTimestamp(), chalk.bgRed(chalk.black(" ERROR ")), chalk.red(message));
        console.error(error);
    }

    request(method: string, url: string, responseCode: number) {
        console.info(
            this.formatTimestamp(),
            chalk.bgCyan(chalk.black(" [API] ")),
            chalk.cyan(method),
            url,
            this.formatResponseCode(responseCode),
        );
    }

    private formatTimestamp() {
        const timestamp = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(Date.now());
        return chalk.cyanBright(`[${timestamp}]`);
    }

    private formatResponseCode(code: number) {
        switch (true) {
            case code < 300:
                return chalk.green(code);

            case code >= 300 && code < 400:
                return chalk.cyan(code);

            case code >= 400 && code < 500:
                return chalk.yellow(code);

            default:
                return chalk.red(code);
        }
    }
}

export default new Logger();
