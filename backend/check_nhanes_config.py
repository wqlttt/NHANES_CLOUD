#!/usr/bin/env python3
"""
NHANES配置检查和设置脚本
用于检查和配置NHANES数据路径
"""

import os
import sys
from pathlib import Path

# 添加当前目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def check_config():
    """检查当前NHANES配置状态"""
    print("=== NHANES配置检查 ===")
    
    try:
        from GetNhanes import config
        print("✓ 配置模块导入成功")
        
        try:
            base_path = config.get_base_path()
            print(f"✓ 当前配置路径: {base_path}")
            
            if os.path.exists(base_path):
                print("✓ 路径存在")
                # 检查路径内容
                subdirs = [d for d in os.listdir(base_path) if os.path.isdir(os.path.join(base_path, d))]
                print(f"✓ 发现子目录: {subdirs[:5]}{'...' if len(subdirs) > 5 else ''}")
            else:
                print("✗ 路径不存在")
                return False
                
        except Exception as e:
            print(f"✗ 获取配置路径失败: {e}")
            return False
            
    except Exception as e:
        print(f"✗ 配置模块导入失败: {e}")
        return False
    
    return True

def suggest_paths():
    """建议可能的NHANES数据路径"""
    print("\n=== 建议的NHANES数据路径 ===")
    
    possible_paths = [
        "D:/NHANES_DATA",
        "E:/NHANES_DATA", 
        "./nhanes_data",
        "../nhanes_data",
        "/app/nhanes_data",  # Docker路径
        "/data/nhanes",
        os.path.expanduser("~/NHANES_DATA"),
    ]
    
    existing_paths = []
    for path in possible_paths:
        if os.path.exists(path):
            print(f"✓ 发现: {path}")
            existing_paths.append(path)
        else:
            print(f"✗ 不存在: {path}")
    
    return existing_paths

def set_path_interactive():
    """交互式设置路径"""
    print("\n=== 交互式路径设置 ===")
    
    existing_paths = suggest_paths()
    
    if existing_paths:
        print(f"\n发现 {len(existing_paths)} 个可能的路径:")
        for i, path in enumerate(existing_paths, 1):
            print(f"{i}. {path}")
        
        try:
            choice = input(f"\n选择一个路径 (1-{len(existing_paths)}) 或输入自定义路径: ").strip()
            
            if choice.isdigit() and 1 <= int(choice) <= len(existing_paths):
                selected_path = existing_paths[int(choice) - 1]
            else:
                selected_path = choice
                
            if not os.path.exists(selected_path):
                print(f"警告: 路径不存在: {selected_path}")
                create = input("是否创建此路径? (y/n): ").strip().lower()
                if create == 'y':
                    os.makedirs(selected_path, exist_ok=True)
                    print(f"已创建路径: {selected_path}")
                else:
                    print("取消设置")
                    return False
            
            # 设置路径
            from GetNhanes import config
            config.set_base_path(selected_path)
            print(f"✓ 已设置NHANES数据路径: {selected_path}")
            return True
            
        except (ValueError, KeyboardInterrupt):
            print("取消设置")
            return False
    else:
        custom_path = input("请输入NHANES数据路径: ").strip()
        if custom_path and os.path.exists(custom_path):
            from GetNhanes import config
            config.set_base_path(custom_path)
            print(f"✓ 已设置NHANES数据路径: {custom_path}")
            return True
        else:
            print("路径无效或不存在")
            return False

def main():
    """主函数"""
    print("NHANES配置检查工具\n")
    
    if check_config():
        print("\n✓ NHANES配置正常，数据提取功能应该可用")
        return
    
    print("\n✗ NHANES配置有问题，需要设置正确的数据路径")
    
    try:
        if set_path_interactive():
            print("\n重新检查配置...")
            if check_config():
                print("\n✓ 配置设置成功！")
            else:
                print("\n✗ 配置仍有问题，请检查路径是否包含正确的NHANES数据")
        else:
            print("\n配置未完成")
    except Exception as e:
        print(f"\n设置过程中出错: {e}")

if __name__ == "__main__":
    main()
