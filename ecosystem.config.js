module.exports = {
  apps: [
    {
      name: "summorners-war", // 앱 이름
      script: "dist/main.js", // 실행할 스크립트 경로 (NestJS 빌드 결과물)
      instances: "max", // CPU 코어 수만큼 프로세스 생성 (클러스터 모드)
      exec_mode: "cluster", // 클러스터 모드로 실행하여 로드 밸런싱
      watch: false, // 운영 환경에서는 watch를 끄는 것이 좋습니다.
      max_memory_restart: "1G", // 메모리 사용량이 1GB를 넘으면 자동 재시작
      env: {
        NODE_ENV: "DEV",
      },
      env_production: {
        NODE_ENV: "PROD",
      },
      // 로그 관리 설정 (옵션)
      // out_file: './logs/out.log',
      // error_file: './logs/error.log',
      // merge_logs: true,
      // time: true,
    },
  ],
};
