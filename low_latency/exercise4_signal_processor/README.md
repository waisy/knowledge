# Exercise 4: Low-Latency Trading Signal Processor

**Objective**: Build a system to process real-time market data and generate trading signals with minimal latency.

## Description
This project simulates a trading system that processes incoming market ticks (price updates) and generates buy/sell signals based on a simple moving average crossover strategy.

## Tasks
- Implement a Tick class to represent market data (e.g., price, timestamp).
- Build a SignalProcessor that maintains a sliding window of prices and computes two moving averages (e.g., 10-tick and 50-tick).
- Generate a signal (buy/sell) when the short-term average crosses the long-term average.
- Use a lock-free data structure (e.g., Agrona's RingBuffer) to handle incoming ticks.
- Measure end-to-end latency from tick receipt to signal generation.

## Key Low-Latency Techniques
- Use fixed-size arrays for sliding windows to avoid dynamic resizing.
- Minimize allocations by reusing Tick objects.
- Use Disruptor or Agrona for high-performance event processing.

## Sample Code Skeleton
```java
public class SignalProcessor {
    private final double[] shortWindow = new double[10];
    private final double[] longWindow = new double[50];
    private int shortIndex = 0, longIndex = 0;

    public void processTick(Tick tick) {
        long startTime = System.nanoTime();
        shortWindow[shortIndex % 10] = tick.price;
        longWindow[longIndex % 50] = tick.price;
        shortIndex++;
        longIndex++;
        if (shortIndex >= 10 && longIndex >= 50) {
            double shortAvg = computeAverage(shortWindow);
            double longAvg = computeAverage(longWindow);
            if (shortAvg > longAvg) {
                System.out.println("Buy signal");
            } else if (shortAvg < longAvg) {
                System.out.println("Sell signal");
            }
        }
        long latency = System.nanoTime() - startTime;
        System.out.println("Signal processed in " + latency + " ns");
    }

    private double computeAverage(double[] window) {
        double sum = 0;
        for (double v : window) sum += v;
        return sum / window.length;
    }

    static class Tick {
        double price;
        long timestamp;
    }
}
```

## Challenge
- Optimize to process 10 million ticks/second with < 500 ns latency.
- Add support for multiple strategies running concurrently.

## Potential Enhancements with Advanced Memory Management
- **Object Pooling**: Implement a pool for Tick objects to reduce allocation pressure.
- **Value Objects**: Use value types (with Project Valhalla in future Java versions) to avoid header overhead.
- **Struct-Like Objects**: Store tick data in packed binary format for better cache locality.
- **Pre-computed Aggregations**: Optimize moving average calculations with incremental algorithms. 