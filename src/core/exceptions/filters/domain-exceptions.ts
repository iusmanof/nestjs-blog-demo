import { DomainExceptionCode } from './domain-exception-codes';

export class Extension {
  constructor(
    public message: string,
    public field: string,
  ) {}
}

export class DomainException extends Error {
  message: string;
  code: DomainExceptionCode;
  extensions: Extension[];

  constructor(errorInfo: {
    code: DomainExceptionCode;
    message: string;
    extensions?: Extension[];
  }) {
    super(errorInfo.message);
    this.message = errorInfo.message;
    this.code = errorInfo.code;
    this.extensions = errorInfo.extensions || [];
  }
}
//
// import { HttpException, HttpStatus } from '@nestjs/common';
// import { DomainExceptionCode } from './domain-exception-codes';
//
// export class Extension {
//   constructor(
//     public message: string,
//     public field: string,
//   ) {}
// }
//
// export class DomainException extends HttpException {
//   code: DomainExceptionCode;
//   extensions: Extension[];
//
//   constructor(errorInfo: {
//     code: DomainExceptionCode;
//     message: string;
//     extensions?: Extension[];
//   }) {
//     super(
//       {
//         errorsMessages: errorInfo.extensions ?? [],
//       },
//       HttpStatus.BAD_REQUEST,
//     );
//
//     this.code = errorInfo.code;
//     this.extensions = errorInfo.extensions ?? [];
//   }
// }
