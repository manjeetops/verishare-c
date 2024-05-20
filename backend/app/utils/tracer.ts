import { initTracer, Span, SpanContext } from 'jaeger-client';

const JAEGER_AGENT_HOST = process.env.JAEGER_AGENT_HOST;
const JAEGER_AGENT_PORT = process.env.JAEGER_AGENT_PORT;

export class Tracer {
  serviceName: string;
  logger: any;
  tracer: any;

  constructor(serviceName: string, logger: any = console, verbose: boolean = true) {
    this.serviceName = serviceName;
    this.logger = logger ? logger : console;
    this.tracer = initTracer(this.config(verbose), this.options());
  }

  config(verbose: boolean = true) {
    // Should fail to start if JAEGER_AGENT_HOST is not provided in the container utilizing this code.
    if (!Boolean(JAEGER_AGENT_HOST)) {
      throw Error('JAEGER_AGENT_HOST not found in ENV');
    }

    return {
      serviceName: this.serviceName,
      sampler: {
        type: 'const',
        param: 1,
      },
      reporter: {
        agentHost: JAEGER_AGENT_HOST,
        agentPORT: JAEGER_AGENT_PORT,
        logSpans: verbose,
      },
    };
  }

  options() {
    const options = {
      logger: this.logger,
    };

    return options;
  }

  startSpan(name: string, parentSpan?: any) {
    let childOf;

    if (typeof parentSpan === 'string') {
      childOf = SpanContext.fromString(parentSpan);
    } else if (parentSpan instanceof Span) {
      childOf = parentSpan.context();
    } else if (parentSpan instanceof SpanContext) {
      childOf = parentSpan;
    }
    return this.tracer.startSpan(name, { childOf });
  }
}
